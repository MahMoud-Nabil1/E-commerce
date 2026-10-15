// Contract for all review operations: create, update, delete, and querying.
package com.ecommerce.ecommerce.Services;

import com.ecommerce.ecommerce.Payload.ReviewDTO;
import com.ecommerce.ecommerce.Payload.ReviewResponse;
import com.ecommerce.ecommerce.Payload.ReviewSummaryDTO;

public interface ReviewService {

    // Buyer submits a new review — purchase check enforced inside.
    ReviewDTO addReview(Long productId, ReviewDTO reviewDTO);

    // Buyer edits their own review — ownership enforced inside.
    ReviewDTO updateReview(Long reviewId, ReviewDTO reviewDTO);

    // Buyer deletes their own review — ownership enforced inside.
    void deleteReview(Long reviewId);

    // Admin removes any review for moderation purposes.
    void adminDeleteReview(Long reviewId);

    // Public: paginated reviews for a product (product page / carousel).
    ReviewResponse getProductReviews(Long productId, Integer pageNumber, Integer pageSize,
                                     String sortBy, String sortOrder);

    // Seller dashboard: all reviews across the seller's products.
    ReviewResponse getSellerReviews(Integer pageNumber, Integer pageSize,
                                    String sortBy, String sortOrder);

    // Buyer: their own review history.
    ReviewResponse getMyReviews(Integer pageNumber, Integer pageSize);

    // Admin: all reviews system-wide.
    ReviewResponse getAllReviews(Integer pageNumber, Integer pageSize,
                                 String sortBy, String sortOrder);

    // Public: aggregated star summary for a product.
    ReviewSummaryDTO getProductReviewSummary(Long productId);
}
