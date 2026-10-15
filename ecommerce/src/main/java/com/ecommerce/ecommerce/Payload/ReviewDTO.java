// DTO: review data sent to and returned from the client.
package com.ecommerce.ecommerce.Payload;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ReviewDTO {

    // Null on create requests; populated in responses.
    private Long reviewId;

    // Populated in responses so the client knows which product this review belongs to.
    private Long productId;
    private String productName;

    // Populated in responses so the client can display the reviewer's identity.
    private Long userId;
    private String username;

    @NotNull(message = "Rating is required")
    @Min(value = 1, message = "Rating must be at least 1")
    @Max(value = 5, message = "Rating must be at most 5")
    private Integer rating;

    // Optional short title for the review.
    private String headline;

    // The review body — optional; buyer may leave a rating-only review.
    private String comment;

    // True when the reviewer has a confirmed purchase of this product.
    private boolean verifiedPurchase;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
