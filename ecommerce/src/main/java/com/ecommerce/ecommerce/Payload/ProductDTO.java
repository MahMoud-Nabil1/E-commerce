package com.ecommerce.ecommerce.Payload;


import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Data Transfer Object representing the product details returned to the client.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ProductDTO {
    private Long productId;

    @NotBlank(message = "Product name must not be blank")
    @Size(min = 3, message = "Product name must contain at least 3 characters")
    private String productName;

    private String image;

    @NotBlank(message = "Product description must not be blank")
    @Size(min = 6, message = "Product description must contain at least 6 characters")
    private String description;

    @NotNull(message = "Quantity must not be null")
    @Min(value = 0, message = "Quantity must be zero or greater")
    private Integer quantity;

    @Min(value = 0, message = "Price must be zero or greater")
    private double price;

    @Min(value = 0, message = "Discount must be zero or greater")
    private double discount;

    private double specialPrice;
}
