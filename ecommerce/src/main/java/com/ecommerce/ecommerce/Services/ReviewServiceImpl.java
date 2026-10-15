// Full implementation of ReviewService: purchase check, ownership guards, CRUD, and aggregation.
package com.ecommerce.ecommerce.Services;

import com.ecommerce.ecommerce.Models.Product;
import com.ecommerce.ecommerce.Models.Review;
import com.ecommerce.ecommerce.Models.User;
import com.ecommerce.ecommerce.Payload.ReviewDTO;
import com.ecommerce.ecommerce.Payload.ReviewResponse;
import com.ecommerce.ecommerce.Payload.ReviewSummaryDTO;
import com.ecommerce.ecommerce.Repositories.OrderItemRepository;
import com.ecommerce.ecommerce.Repositories.ProductRepository;
import com.ecommerce.ecommerce.Repositories.ReviewRepository;
import com.ecommerce.ecommerce.exceptions.APIException;
import com.ecommerce.ecommerce.exceptions.ResourceNotFoundException;
import com.ecommerce.ecommerce.util.AuthUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class ReviewServiceImpl implements ReviewService {

    @Autowired
    private ReviewRepository reviewRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private OrderItemRepository orderItemRepository;

    @Autowired
    private AuthUtil authUtil;

    // ── Create ────────────────────────────────────────────────────────────────

    @Override
    @Transactional
    public ReviewDTO addReview(Long productId, ReviewDTO reviewDTO) {
        User currentUser = authUtil.loggedInUser();
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product", "productId", productId));

        // A seller cannot review their own product.
        if (product.getUser() != null && product.getUser().getUserId().equals(currentUser.getUserId())) {
            throw new APIException("You cannot review your own product");
        }

        // Enforce the one-review-per-product constraint before hitting the DB unique key.
        reviewRepository.findByUserUserIdAndProductProductId(currentUser.getUserId(), productId)
                .ifPresent(r -> { throw new APIException("You have already reviewed this product"); });

        // Verify the user has actually purchased this product.
        boolean hasPurchased = orderItemRepository.existsByOrderEmailAndProductId(
                currentUser.getEmail(), productId);
        if (!hasPurchased) {
            throw new APIException("You can only review products you have purchased");
        }

        Review review = new Review();
        review.setUser(currentUser);
        review.setProduct(product);
        review.setRating(reviewDTO.getRating());
        review.setHeadline(reviewDTO.getHeadline());
        review.setComment(reviewDTO.getComment());
        review.setVerifiedPurchase(true); // we just confirmed above

        Review saved = reviewRepository.save(review);
        return mapToDTO(saved);
    }

    // ── Update ────────────────────────────────────────────────────────────────

    @Override
    @Transactional
    public ReviewDTO updateReview(Long reviewId, ReviewDTO reviewDTO) {
        User currentUser = authUtil.loggedInUser();
        Review review = findReviewById(reviewId);

        // Only the author may edit their review.
        if (!review.getUser().getUserId().equals(currentUser.getUserId())) {
            throw new APIException("You are not authorised to edit this review");
        }

        review.setRating(reviewDTO.getRating());
        review.setHeadline(reviewDTO.getHeadline());
        review.setComment(reviewDTO.getComment());

        return mapToDTO(reviewRepository.save(review));
    }

    // ── Delete (buyer) ────────────────────────────────────────────────────────

    @Override
    @Transactional
    public void deleteReview(Long reviewId) {
        User currentUser = authUtil.loggedInUser();
        Review review = findReviewById(reviewId);

        // Only the author may delete their own review.
        if (!review.getUser().getUserId().equals(currentUser.getUserId())) {
            throw new APIException("You are not authorised to delete this review");
        }

        reviewRepository.delete(review);
    }

    // ── Delete (admin) ────────────────────────────────────────────────────────

    @Override
    @Transactional
    public void adminDeleteReview(Long reviewId) {
        // Admin can delete any review — no ownership check required.
        Review review = findReviewById(reviewId);
        reviewRepository.delete(review);
    }

    // ── Read: product reviews (public) ───────────────────────────────────────

    @Override
    public ReviewResponse getProductReviews(Long productId, Integer pageNumber, Integer pageSize,
                                            String sortBy, String sortOrder) {
        if (!productRepository.existsById(productId)) {
            throw new ResourceNotFoundException("Product", "productId", productId);
        }

        Pageable pageable = buildPageable(pageNumber, pageSize, sortBy, sortOrder);
        Page<Review> page = reviewRepository.findByProductProductId(productId, pageable);
        return buildResponse(page);
    }

    // ── Read: seller dashboard ────────────────────────────────────────────────

    @Override
    public ReviewResponse getSellerReviews(Integer pageNumber, Integer pageSize,
                                           String sortBy, String sortOrder) {
        Long sellerId = authUtil.loggedInUserId();
        Pageable pageable = buildPageable(pageNumber, pageSize, sortBy, sortOrder);
        Page<Review> page = reviewRepository.findByProductSellerId(sellerId, pageable);
        return buildResponse(page);
    }

    // ── Read: buyer's own reviews ─────────────────────────────────────────────

    @Override
    public ReviewResponse getMyReviews(Integer pageNumber, Integer pageSize) {
        Long userId = authUtil.loggedInUserId();
        Pageable pageable = PageRequest.of(pageNumber, pageSize, Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<Review> page = reviewRepository.findByUserUserId(userId, pageable);
        return buildResponse(page);
    }

    // ── Read: all reviews (admin) ─────────────────────────────────────────────

    @Override
    public ReviewResponse getAllReviews(Integer pageNumber, Integer pageSize,
                                        String sortBy, String sortOrder) {
        Pageable pageable = buildPageable(pageNumber, pageSize, sortBy, sortOrder);
        Page<Review> page = reviewRepository.findAll(pageable);
        return buildResponse(page);
    }

    // ── Read: aggregated summary ──────────────────────────────────────────────

    @Override
    public ReviewSummaryDTO getProductReviewSummary(Long productId) {
        if (!productRepository.existsById(productId)) {
            throw new ResourceNotFoundException("Product", "productId", productId);
        }

        Double avg = reviewRepository.findAverageRatingByProductId(productId);
        long total = reviewRepository.countByProductProductId(productId);
        List<Object[]> rows = reviewRepository.countByRatingForProduct(productId);

        // Start with all stars at 0 so the response always has keys 1–5.
        Map<Integer, Long> starCounts = new HashMap<>();
        for (int i = 1; i <= 5; i++) {
            starCounts.put(i, 0L);
        }
        for (Object[] row : rows) {
            Integer star = (Integer) row[0];
            Long count = (Long) row[1];
            starCounts.put(star, count);
        }

        double roundedAvg = avg != null ? Math.round(avg * 10.0) / 10.0 : 0.0;
        return new ReviewSummaryDTO(productId, roundedAvg, total, starCounts);
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    private Review findReviewById(Long reviewId) {
        return reviewRepository.findById(reviewId)
                .orElseThrow(() -> new ResourceNotFoundException("Review", "reviewId", reviewId));
    }

    private Pageable buildPageable(Integer pageNumber, Integer pageSize,
                                   String sortBy, String sortOrder) {
        Sort sort = sortOrder.equalsIgnoreCase("asc")
                ? Sort.by(sortBy).ascending()
                : Sort.by(sortBy).descending();
        return PageRequest.of(pageNumber, pageSize, sort);
    }

    private ReviewResponse buildResponse(Page<Review> page) {
        List<ReviewDTO> dtos = page.getContent().stream()
                .map(this::mapToDTO)
                .toList();

        return new ReviewResponse(
                dtos,
                page.getNumber(),
                page.getSize(),
                page.getTotalElements(),
                page.getTotalPages(),
                page.isLast()
        );
    }

    // Maps a Review entity to a ReviewDTO, populating all read-only fields.
    private ReviewDTO mapToDTO(Review review) {
        ReviewDTO dto = new ReviewDTO();
        dto.setReviewId(review.getReviewId());
        dto.setProductId(review.getProduct().getProductId());
        dto.setProductName(review.getProduct().getProductName());
        dto.setUserId(review.getUser().getUserId());
        dto.setUsername(review.getUser().getUsername());
        dto.setRating(review.getRating());
        dto.setHeadline(review.getHeadline());
        dto.setComment(review.getComment());
        dto.setVerifiedPurchase(review.isVerifiedPurchase());
        dto.setCreatedAt(review.getCreatedAt());
        dto.setUpdatedAt(review.getUpdatedAt());
        return dto;
    }
}
