// DB entity: a sellable product with pricing, stock, and category.
package com.ecommerce.ecommerce.Models;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.ToString;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "products", indexes = {
        // 1. Optimize fetching products for a specific category (essential for category catalog pages)
        @Index(name = "idx_product_category", columnList = "category_id"),

        // 2. Optimize fetching products listed by a specific seller (essential for seller dashboard)
        @Index(name = "idx_product_seller", columnList = "seller_id"),

        // 3. Speed up filtering and sorting by the effective discounted price
        @Index(name = "idx_product_special_price", columnList = "special_price"),

        // 4. Optimize direct search queries and alphabetical sorting by product name
        @Index(name = "idx_product_name", columnList = "product_name"),

        // 5. Composite Index: Optimize filtering and sorting by price within a specific category simultaneously
        @Index(name = "idx_category_special_price", columnList = "category_id, special_price")
})
public class Product {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long productId;

    @NotBlank
    @Size(min = 3, message = "Product name must contain atleast 3 characters")
    private String productName;

    private String image;

    @NotBlank
    @Size(min = 6, message = "Product description must contain atleast 6 characters")
    private String description;

    private Integer quantity;
    private double price;
    private double discount;
    // Computed server-side: price minus discount percentage.
    private double specialPrice;

    @ManyToOne
    @JoinColumn(name = "category_id")
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private Category category;

    // The seller who listed this product.
    @ManyToOne
    @JoinColumn(name = "seller_id")
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private User user;
}