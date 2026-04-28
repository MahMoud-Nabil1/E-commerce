package com.ecommerce.ecommerce.Services;

import com.ecommerce.ecommerce.Payload.ProductDTO;
import com.ecommerce.ecommerce.Payload.ProductResponse;
import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;

/**
 * Service interface for product-related business logic.
 */
public interface ProductService {
    // Basic CRUD and filtering operations
    ProductDTO addProduct(Long categoryId, ProductDTO product);

    ProductResponse getAllProducts(Integer pageNumber, Integer pageSize, String sortBy, String sortOrder, String keyword, String category);

    ProductResponse searchByCategory(Long categoryId, Integer pageNumber, Integer pageSize, String sortBy, String sortOrder);

    ProductResponse searchProductByKeyword(String keyword, Integer pageNumber, Integer pageSize, String sortBy, String sortOrder);

    ProductDTO updateProduct(Long productId, ProductDTO product);

    ProductDTO deleteProduct(Long productId);

    // Image handling
    ProductDTO updateProductImage(Long productId, MultipartFile image) throws IOException;

    // Role-specific retrieval
    ProductResponse getAllProductsForAdmin(Integer pageNumber, Integer pageSize, String sortBy, String sortOrder);

    ProductResponse getAllProductsForSeller(Integer pageNumber, Integer pageSize, String sortBy, String sortOrder);
}