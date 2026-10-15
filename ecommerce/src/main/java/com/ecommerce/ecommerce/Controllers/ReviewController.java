// HTTP endpoints for submitting, editing, deleting, and reading product reviews.
package com.ecommerce.ecommerce.Controllers;

import com.ecommerce.ecommerce.Payload.ReviewDTO;
import com.ecommerce.ecommerce.Payload.ReviewResponse;
import com.ecommerce.ecommerce.Payload.ReviewSummaryDTO;
import com.ecommerce.ecommerce.Services.ReviewService;
import com.ecommerce.ecommerce.config.AppConstants;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api")
public class ReviewController {

    @Autowired
    private ReviewService reviewService;

    // ── Public (no auth required) ─────────────────────────────────────────────

    /**
     * What it does: Returns all reviews for a product, sorted and paginated.
     * What it expects: productId in the path; optional pagination/sort params.
     * What it returns: A ReviewResponse with a list of ReviewDTOs and pagination metadata.
     */
    @GetMapping("/public/products/{productId}/reviews")
    public ResponseEntity<ReviewResponse> getProductReviews(
            @PathVariable Long productId,
            @RequestParam(defaultValue = AppConstants.PAGE_NUMBER, required = false) Integer pageNumber,
            @RequestParam(defaultValue = AppConstants.PAGE_SIZE,   required = false) Integer pageSize,
            @RequestParam(defaultValue = "createdAt",              required = false) String sortBy,
            @RequestParam(defaultValue = "desc",                   required = false) String sortOrder
    ) {
        ReviewResponse response = reviewService.getProductReviews(productId, pageNumber, pageSize, sortBy, sortOrder);
        return ResponseEntity.ok(response);
    }

    /**
     * What it does: Returns the aggregated star-rating summary for a product.
     * What it expects: productId in the path.
     * What it returns: A ReviewSummaryDTO with averageRating, totalReviews, and per-star counts.
     */
    @GetMapping("/public/products/{productId}/reviews/summary")
    public ResponseEntity<ReviewSummaryDTO> getProductReviewSummary(@PathVariable Long productId) {
        ReviewSummaryDTO summary = reviewService.getProductReviewSummary(productId);
        return ResponseEntity.ok(summary);
    }

    // ── Buyer (any authenticated user) ───────────────────────────────────────

    /**
     * What it does: Submits a new review for a product the current user has purchased.
     * What it expects: productId in the path; a valid ReviewDTO (rating required) in the body.
     * What it returns: The saved ReviewDTO with 201 Created.
     */
    @PostMapping("/products/{productId}/reviews")
    public ResponseEntity<ReviewDTO> addReview(
            @PathVariable Long productId,
            @Valid @RequestBody ReviewDTO reviewDTO
    ) {
        ReviewDTO created = reviewService.addReview(productId, reviewDTO);
        return new ResponseEntity<>(created, HttpStatus.CREATED);
    }

    /**
     * What it does: Edits the current user's existing review.
     * What it expects: reviewId in the path; updated ReviewDTO (rating required) in the body.
     * What it returns: The updated ReviewDTO with 200 OK.
     */
    @PutMapping("/reviews/{reviewId}")
    public ResponseEntity<ReviewDTO> updateReview(
            @PathVariable Long reviewId,
            @Valid @RequestBody ReviewDTO reviewDTO
    ) {
        ReviewDTO updated = reviewService.updateReview(reviewId, reviewDTO);
        return ResponseEntity.ok(updated);
    }

    /**
     * What it does: Deletes the current user's own review.
     * What it expects: reviewId in the path.
     * What it returns: 204 No Content on success.
     */
    @DeleteMapping("/reviews/{reviewId}")
    public ResponseEntity<Void> deleteReview(@PathVariable Long reviewId) {
        reviewService.deleteReview(reviewId);
        return ResponseEntity.noContent().build();
    }

    /**
     * What it does: Lists all reviews written by the currently logged-in user.
     * What it expects: Optional pagination params.
     * What it returns: A ReviewResponse with the user's review history.
     */
    @GetMapping("/reviews/my-reviews")
    public ResponseEntity<ReviewResponse> getMyReviews(
            @RequestParam(defaultValue = AppConstants.PAGE_NUMBER, required = false) Integer pageNumber,
            @RequestParam(defaultValue = AppConstants.PAGE_SIZE,   required = false) Integer pageSize
    ) {
        ReviewResponse response = reviewService.getMyReviews(pageNumber, pageSize);
        return ResponseEntity.ok(response);
    }

    // ── Seller dashboard ──────────────────────────────────────────────────────

    /**
     * What it does: Lists all reviews left on the logged-in seller's products.
     * What it expects: Seller auth; optional pagination/sort params.
     * What it returns: A paginated ReviewResponse scoped to the seller's product catalogue.
     */
    @GetMapping("/seller/reviews")
    public ResponseEntity<ReviewResponse> getSellerReviews(
            @RequestParam(defaultValue = AppConstants.PAGE_NUMBER, required = false) Integer pageNumber,
            @RequestParam(defaultValue = AppConstants.PAGE_SIZE,   required = false) Integer pageSize,
            @RequestParam(defaultValue = "createdAt",              required = false) String sortBy,
            @RequestParam(defaultValue = "desc",                   required = false) String sortOrder
    ) {
        ReviewResponse response = reviewService.getSellerReviews(pageNumber, pageSize, sortBy, sortOrder);
        return ResponseEntity.ok(response);
    }

    /**
     * What it does: Lists reviews for a specific product owned by the logged-in seller.
     * What it expects: productId in the path; seller auth; optional pagination params.
     * What it returns: A paginated ReviewResponse for that product.
     */
    @GetMapping("/seller/products/{productId}/reviews")
    public ResponseEntity<ReviewResponse> getSellerProductReviews(
            @PathVariable Long productId,
            @RequestParam(defaultValue = AppConstants.PAGE_NUMBER, required = false) Integer pageNumber,
            @RequestParam(defaultValue = AppConstants.PAGE_SIZE,   required = false) Integer pageSize,
            @RequestParam(defaultValue = "createdAt",              required = false) String sortBy,
            @RequestParam(defaultValue = "desc",                   required = false) String sortOrder
    ) {
        // Reuses the public product-review query — the seller can see the same data.
        ReviewResponse response = reviewService.getProductReviews(productId, pageNumber, pageSize, sortBy, sortOrder);
        return ResponseEntity.ok(response);
    }

    // ── Admin ─────────────────────────────────────────────────────────────────

    /**
     * What it does: Lists all reviews system-wide for admin moderation.
     * What it expects: Admin auth; optional pagination/sort params.
     * What it returns: A paginated ReviewResponse across every product.
     */
    @GetMapping("/admin/reviews")
    public ResponseEntity<ReviewResponse> getAllReviews(
            @RequestParam(defaultValue = AppConstants.PAGE_NUMBER, required = false) Integer pageNumber,
            @RequestParam(defaultValue = AppConstants.PAGE_SIZE,   required = false) Integer pageSize,
            @RequestParam(defaultValue = "createdAt",              required = false) String sortBy,
            @RequestParam(defaultValue = "desc",                   required = false) String sortOrder
    ) {
        ReviewResponse response = reviewService.getAllReviews(pageNumber, pageSize, sortBy, sortOrder);
        return ResponseEntity.ok(response);
    }

    /**
     * What it does: Lets an admin delete any review for moderation purposes.
     * What it expects: reviewId in the path; admin auth.
     * What it returns: 204 No Content on success.
     */
    @DeleteMapping("/admin/reviews/{reviewId}")
    public ResponseEntity<Void> adminDeleteReview(@PathVariable Long reviewId) {
        reviewService.adminDeleteReview(reviewId);
        return ResponseEntity.noContent().build();
    }
}
