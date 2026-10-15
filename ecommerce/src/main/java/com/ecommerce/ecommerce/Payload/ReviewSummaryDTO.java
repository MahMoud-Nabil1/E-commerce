// DTO: aggregated review statistics for a single product.
package com.ecommerce.ecommerce.Payload;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ReviewSummaryDTO {

    private Long productId;

    // Rounded to one decimal place (e.g. 4.3).
    private double averageRating;

    private long totalReviews;

    // Star distribution: key = star value (1–5), value = count of reviews with that rating.
    // e.g. { 1: 2, 2: 0, 3: 5, 4: 18, 5: 40 }
    private Map<Integer, Long> starCounts;
}
