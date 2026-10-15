// DB access for reviews: custom queries for product pages, seller dashboard, and aggregation.
package com.ecommerce.ecommerce.Repositories;

import com.ecommerce.ecommerce.Models.Review;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ReviewRepository extends JpaRepository<Review, Long> {

    // Look up a specific user's review of a specific product (used for duplicate check).
    Optional<Review> findByUserUserIdAndProductProductId(Long userId, Long productId);

    // All reviews for a product — used on the public product page.
    Page<Review> findByProductProductId(Long productId, Pageable pageable);

    // All reviews written by a user — used for "my reviews" page.
    Page<Review> findByUserUserId(Long userId, Pageable pageable);

    // All reviews on products that belong to a given seller — used for the seller dashboard.
    @Query("SELECT r FROM Review r WHERE r.product.user.userId = :sellerId")
    Page<Review> findByProductSellerId(@Param("sellerId") Long sellerId, Pageable pageable);

    // Average star rating for a product — used in the summary endpoint and ProductDTO enrichment.
    @Query("SELECT AVG(r.rating) FROM Review r WHERE r.product.productId = :productId")
    Double findAverageRatingByProductId(@Param("productId") Long productId);

    // Total number of reviews for a product.
    long countByProductProductId(Long productId);

    // Per-star counts for a product (returns pairs of [rating, count]).
    @Query("SELECT r.rating, COUNT(r) FROM Review r WHERE r.product.productId = :productId GROUP BY r.rating ORDER BY r.rating")
    List<Object[]> countByRatingForProduct(@Param("productId") Long productId);
}
