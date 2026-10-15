// DB entity: a buyer's review for a product they purchased.
package com.ecommerce.ecommerce.Models;

import jakarta.persistence.*;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.ToString;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "reviews",
        uniqueConstraints = {
                // One review per user per product.
                @UniqueConstraint(name = "uk_review_user_product", columnNames = {"user_id", "product_id"})
        },
        indexes = {
                // Optimize fetching all reviews for a given product (catalog / product page).
                @Index(name = "idx_review_product", columnList = "product_id"),

                // Optimize fetching all reviews written by a specific user ("my reviews").
                @Index(name = "idx_review_user", columnList = "user_id"),

                // Optimize sorting / filtering by star rating.
                @Index(name = "idx_review_rating", columnList = "rating")
        })
public class Review {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long reviewId;

    // The buyer who wrote this review.
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private User user;

    // The product being reviewed.
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false)
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private Product product;

    // Star rating 1–5 (enforced at the DTO level too).
    @NotNull
    @Min(1)
    @Max(5)
    @Column(nullable = false)
    private Integer rating;

    // Optional short title for the review.
    @Column(length = 120)
    private String headline;

    // The review body — nullable so buyers can leave a rating-only review.
    @Column(columnDefinition = "TEXT")
    private String comment;

    // Set to true at creation time when the buyer has a confirmed purchase.
    // Stored so reads don't need to re-join with orders on every request.
    @Column(nullable = false)
    private boolean verifiedPurchase = false;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;
}
