package com.ecommerce.ecommerce.Models;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.ToString;

/**
 * Entity mapping for the 'products' table in the database.
 * Contains validation constraints and defines relationships with Categories and Users (Sellers).
 */
@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "products")
public class Product {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
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
    private double specialPrice;

    // Many products belong to one category
    @ManyToOne
    @JoinColumn(name = "category_id")
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private Category category;

    // The seller who owns/listed this product
    @ManyToOne
    @JoinColumn(name = "seller_id")
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private User user;
}