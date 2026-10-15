// HTTP endpoints for products: admin, seller, and public access.
package com.ecommerce.ecommerce.Controllers;

import com.ecommerce.ecommerce.config.AppConstants;
import com.ecommerce.ecommerce.Payload.ProductDTO;
import com.ecommerce.ecommerce.Payload.ProductResponse;
import com.ecommerce.ecommerce.Services.ProductService;
import com.ecommerce.ecommerce.Services.FileService;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.util.StreamUtils;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.FileNotFoundException;
import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Paths;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class ProductController {

    private final ProductService productService;
    private final FileService fileService;

    @Value("${project.image}")
    private String path;

    // ======================== ADMIN ENDPOINTS ========================

    /**
     * What it does: Creates a new product and associates it with a given category. Admin access only.
     * What it expects: 'categoryId' in the URL, and a ProductDTO object in the JSON body containing product details.
     * What it returns: The saved ProductDTO object with 201 Created.
     */
    @PostMapping("/admin/categories/{categoryId}/product")
    public ResponseEntity<ProductDTO> addProduct(@Valid @RequestBody ProductDTO productDTO,
            @PathVariable Long categoryId) {
        ProductDTO savedProductDTO = productService.addProduct(categoryId, productDTO);
        return new ResponseEntity<>(savedProductDTO, HttpStatus.CREATED);
    }

    /**
     * What it does: Updates the details of an existing product. Admin access only.
     * What it expects: 'productId' in the URL, and a ProductDTO with new data in the JSON body.
     * What it returns: The updated ProductDTO object with 200 OK.
     */
    @PutMapping("/admin/products/{productId}")
    public ResponseEntity<ProductDTO> updateProduct(@Valid @RequestBody ProductDTO productDTO,
            @PathVariable Long productId) {
        ProductDTO updatedProductDTO = productService.updateProduct(productId, productDTO);
        return new ResponseEntity<>(updatedProductDTO, HttpStatus.OK);
    }

    /**
     * What it does: Deletes a product by its ID. Admin access only.
     * What it expects: 'productId' in the URL path.
     * What it returns: The deleted ProductDTO confirming removal, with 200 OK.
     */
    @DeleteMapping("/admin/products/{productId}")
    public ResponseEntity<ProductDTO> deleteProduct(@PathVariable Long productId) {
        ProductDTO deletedProduct = productService.deleteProduct(productId);
        return new ResponseEntity<>(deletedProduct, HttpStatus.OK);
    }

    /**
     * What it does: Uploads and replaces the image for a specific product. Admin access only.
     * What it expects: 'productId' in the URL, and a multipart file payload named 'image' in a form-data request.
     * What it returns: The updated ProductDTO including the new image filename with 200 OK.
     */
    @PutMapping("/admin/products/{productId}/image")
    public ResponseEntity<ProductDTO> updateProductImage(@PathVariable Long productId,
            @RequestParam("image") MultipartFile image) throws IOException {
        ProductDTO updatedProduct = productService.updateProductImage(productId, image);
        return new ResponseEntity<>(updatedProduct, HttpStatus.OK);
    }

    /**
     * What it does: Uploads multiple images for an admin's product. Admin access only.
     * What it expects: 'productId' in the path, 'images' array of MultipartFiles in the form-data request.
     * What it returns: The updated ProductDTO with all images, with 200 OK.
     */
    @PostMapping("/admin/products/{productId}/images")
    public ResponseEntity<ProductDTO> addProductImagesAdmin(@PathVariable Long productId,
            @RequestParam("images") MultipartFile[] images) throws IOException {
        ProductDTO updatedProduct = productService.addProductImages(productId, images);
        return new ResponseEntity<>(updatedProduct, HttpStatus.OK);
    }

    /**
     * What it does: Deletes a specific image from an admin's product. Admin access only.
     * What it expects: 'productId' in the path, 'imageUrl' as a request parameter.
     * What it returns: The updated ProductDTO with remaining images, with 200 OK.
     */
    @DeleteMapping("/admin/products/{productId}/images")
    public ResponseEntity<ProductDTO> deleteProductImageAdmin(@PathVariable Long productId,
            @RequestParam("imageUrl") String imageUrl) {
        ProductDTO updatedProduct = productService.deleteProductImage(productId, imageUrl);
        return new ResponseEntity<>(updatedProduct, HttpStatus.OK);
    }

    /**
     * What it does: Lists ALL products in the entire system for administrative views. Admin access only.
     * What it expects: Optional pagination parameters ('pageNumber', 'pageSize', 'sortBy', 'sortOrder').
     * What it returns: A ProductResponse object with pagination metadata and a list of ProductDTOs, with 200 OK.
     */
    @GetMapping("/admin/products")
    public ResponseEntity<ProductResponse> getAllProductsForAdmin(
            @RequestParam(name = "pageNumber", defaultValue = AppConstants.PAGE_NUMBER, required = false) Integer pageNumber,
            @RequestParam(name = "pageSize", defaultValue = AppConstants.PAGE_SIZE, required = false) Integer pageSize,
            @RequestParam(name = "sortBy", defaultValue = AppConstants.SORT_PRODUCTS_BY, required = false) String sortBy,
            @RequestParam(name = "sortOrder", defaultValue = AppConstants.SORT_DIR, required = false) String sortOrder) {
        ProductResponse productResponse = productService.getAllProductsForAdmin(pageNumber, pageSize, sortBy,
                sortOrder);
        return new ResponseEntity<>(productResponse, HttpStatus.OK);
    }

    /**
     * What it does: Lists only the products owned by the currently logged-in admin. Admin access only.
     * What it expects: Optional pagination parameters and valid admin authentication.
     * What it returns: A ProductResponse with just this admin's listed products, with 200 OK.
     */
    @GetMapping("/admin/products/mine")
    public ResponseEntity<ProductResponse> getMyProductsForAdmin(
            @RequestParam(name = "pageNumber", defaultValue = AppConstants.PAGE_NUMBER, required = false) Integer pageNumber,
            @RequestParam(name = "pageSize", defaultValue = AppConstants.PAGE_SIZE, required = false) Integer pageSize,
            @RequestParam(name = "sortBy", defaultValue = AppConstants.SORT_PRODUCTS_BY, required = false) String sortBy,
            @RequestParam(name = "sortOrder", defaultValue = AppConstants.SORT_DIR, required = false) String sortOrder) {
        ProductResponse productResponse = productService.getMyProductsForAdmin(pageNumber, pageSize, sortBy, sortOrder);
        return new ResponseEntity<>(productResponse, HttpStatus.OK);
    }

    // ======================== SELLER ENDPOINTS ========================

    /**
     * What it does: Creates a new product for a specific category under the seller's account. Seller access only.
     * What it expects: 'categoryId' in the URL, ProductDTO in the JSON body.
     * What it returns: The completely saved ProductDTO with 201 Created.
     */
    @PostMapping("/seller/categories/{categoryId}/product")
    public ResponseEntity<ProductDTO> addProductSeller(@Valid @RequestBody ProductDTO productDTO,
            @PathVariable Long categoryId) {
        ProductDTO savedProductDTO = productService.addProduct(categoryId, productDTO);
        return new ResponseEntity<>(savedProductDTO, HttpStatus.CREATED);
    }

    /**
     * What it does: Lists only the products owned by the currently logged-in seller. Seller access only.
     * What it expects: Optional pagination parameters and valid seller authentication.
     * What it returns: A ProductResponse object with pagination and the seller's products, with 200 OK.
     */
    @GetMapping("/seller/products")
    public ResponseEntity<ProductResponse> getAllProductsForSeller(
            @RequestParam(name = "pageNumber", defaultValue = AppConstants.PAGE_NUMBER, required = false) Integer pageNumber,
            @RequestParam(name = "pageSize", defaultValue = AppConstants.PAGE_SIZE, required = false) Integer pageSize,
            @RequestParam(name = "sortBy", defaultValue = AppConstants.SORT_PRODUCTS_BY, required = false) String sortBy,
            @RequestParam(name = "sortOrder", defaultValue = AppConstants.SORT_DIR, required = false) String sortOrder) {
        ProductResponse productResponse = productService.getAllProductsForSeller(pageNumber, pageSize, sortBy,
                sortOrder);
        return new ResponseEntity<>(productResponse, HttpStatus.OK);
    }

    /**
     * What it does: Updates one of the seller's own products. Seller access only.
     * What it expects: 'productId' in the URL, ProductDTO with new data in the JSON body.
     * What it returns: The updated ProductDTO object with 200 OK.
     */
    @PutMapping("/seller/products/{productId}")
    public ResponseEntity<ProductDTO> updateProductSeller(@Valid @RequestBody ProductDTO productDTO,
            @PathVariable Long productId) {
        ProductDTO updatedProductDTO = productService.updateProduct(productId, productDTO);
        return new ResponseEntity<>(updatedProductDTO, HttpStatus.OK);
    }

    /**
     * What it does: Deletes one of the seller's products. Seller access only.
     * What it expects: 'productId' in the URL path.
     * What it returns: The deleted ProductDTO with 200 OK.
     */
    @DeleteMapping("/seller/products/{productId}")
    public ResponseEntity<ProductDTO> deleteProductSeller(@PathVariable Long productId) {
        ProductDTO deletedProduct = productService.deleteProduct(productId);
        return new ResponseEntity<>(deletedProduct, HttpStatus.OK);
    }

    /**
     * What it does: Uploads a new image for one of the seller's products. Seller access only.
     * What it expects: 'productId' in the path, 'image' MultipartFile in the form-data request.
     * What it returns: The updated ProductDTO with the new image string, with 200 OK.
     */
    @PutMapping("/seller/products/{productId}/image")
    public ResponseEntity<ProductDTO> updateProductImageSeller(@PathVariable Long productId,
            @RequestParam("image") MultipartFile image) throws IOException {
        ProductDTO updatedProduct = productService.updateProductImage(productId, image);
        return new ResponseEntity<>(updatedProduct, HttpStatus.OK);
    }

    /**
     * What it does: Uploads multiple images for a seller's product. Seller access only.
     * What it expects: 'productId' in the path, 'images' array of MultipartFiles in the form-data request.
     * What it returns: The updated ProductDTO with all images, with 200 OK.
     */
    @PostMapping("/seller/products/{productId}/images")
    public ResponseEntity<ProductDTO> addProductImagesSeller(@PathVariable Long productId,
            @RequestParam("images") MultipartFile[] images) throws IOException {
        ProductDTO updatedProduct = productService.addProductImages(productId, images);
        return new ResponseEntity<>(updatedProduct, HttpStatus.OK);
    }

    /**
     * What it does: Deletes a specific image from a seller's product. Seller access only.
     * What it expects: 'productId' in the path, 'imageUrl' as a request parameter.
     * What it returns: The updated ProductDTO with remaining images, with 200 OK.
     */
    @DeleteMapping("/seller/products/{productId}/images")
    public ResponseEntity<ProductDTO> deleteProductImageSeller(@PathVariable Long productId,
            @RequestParam("imageUrl") String imageUrl) {
        ProductDTO updatedProduct = productService.deleteProductImage(productId, imageUrl);
        return new ResponseEntity<>(updatedProduct, HttpStatus.OK);
    }

    // ======================== PUBLIC ENDPOINTS ========================

    /**
     * What it does: Fetches a public list of available products, dynamically allowing filtering by keyword and category name.
     * What it expects: Optional query parameters: 'keyword', 'category', and pagination config ('pageNumber', 'pageSize', etc).
     * What it returns: A ProductResponse with pagination details and a list of ProductDTOs, with 200 OK.
     */
    @GetMapping("/public/products")
    public ResponseEntity<ProductResponse> getAllProducts(
            @RequestParam(name = "keyword", required = false) String keyword,
            @RequestParam(name = "category", required = false) String category,
            @RequestParam(name = "pageNumber", defaultValue = AppConstants.PAGE_NUMBER, required = false) Integer pageNumber,
            @RequestParam(name = "pageSize", defaultValue = AppConstants.PAGE_SIZE, required = false) Integer pageSize,
            @RequestParam(name = "sortBy", defaultValue = AppConstants.SORT_PRODUCTS_BY, required = false) String sortBy,
            @RequestParam(name = "sortOrder", defaultValue = AppConstants.SORT_DIR, required = false) String sortOrder) {
        ProductResponse productResponse = productService.getAllProducts(pageNumber, pageSize, sortBy, sortOrder,
                keyword, category);
        return new ResponseEntity<>(productResponse, HttpStatus.OK);
    }

    /**
     * What it does: Fetches a single public product by its ID. Public access.
     * What it expects: 'productId' as a path variable.
     * What it returns: The ProductDTO with 200 OK.
     */
    @GetMapping("/public/products/{productId}")
    public ResponseEntity<ProductDTO> getProductById(@PathVariable Long productId) {
        ProductDTO productDTO = productService.getProductById(productId);
        return new ResponseEntity<>(productDTO, HttpStatus.OK);
    }

    /**
     * What it does: Fetches all active products that belong to a specific category ID. Public access.
     * What it expects: 'categoryId' as a path variable, and optional pagination parameters.
     * What it returns: A ProductResponse with products filtered by that category, with 200 OK.
     */
    @GetMapping("/public/categories/{categoryId}/products")
    public ResponseEntity<ProductResponse> getProductsByCategory(@PathVariable Long categoryId,
            @RequestParam(name = "pageNumber", defaultValue = AppConstants.PAGE_NUMBER, required = false) Integer pageNumber,
            @RequestParam(name = "pageSize", defaultValue = AppConstants.PAGE_SIZE, required = false) Integer pageSize,
            @RequestParam(name = "sortBy", defaultValue = AppConstants.SORT_PRODUCTS_BY, required = false) String sortBy,
            @RequestParam(name = "sortOrder", defaultValue = AppConstants.SORT_DIR, required = false) String sortOrder) {
        ProductResponse productResponse = productService.searchByCategory(categoryId, pageNumber, pageSize, sortBy,
                sortOrder);
        return new ResponseEntity<>(productResponse, HttpStatus.OK);
    }

    /**
     * What it does: Searches all active products where the name matches a specific keyword. Public access.
     * What it expects: 'keyword' as a path variable, and optional pagination parameters.
     * What it returns: A ProductResponse containing search results with 200 OK.
     */
    @GetMapping("/public/products/keyword/{keyword}")
    public ResponseEntity<ProductResponse> getProductsByKeyword(@PathVariable String keyword,
            @RequestParam(name = "pageNumber", defaultValue = AppConstants.PAGE_NUMBER, required = false) Integer pageNumber,
            @RequestParam(name = "pageSize", defaultValue = AppConstants.PAGE_SIZE, required = false) Integer pageSize,
            @RequestParam(name = "sortBy", defaultValue = AppConstants.SORT_PRODUCTS_BY, required = false) String sortBy,
            @RequestParam(name = "sortOrder", defaultValue = AppConstants.SORT_DIR, required = false) String sortOrder) {
        ProductResponse productResponse = productService.searchProductByKeyword(keyword, pageNumber, pageSize, sortBy,
                sortOrder);
        return new ResponseEntity<>(productResponse, HttpStatus.OK);
    }

    /**
     * What it does: This endpoint is deprecated when using Cloudinary.
     * Images are accessed directly via Cloudinary URLs stored in the Product entity.
     * This endpoint now returns HTTP 410 (Gone) to indicate it's no longer available.
     * 
     * Frontend should use the image URL from the product response directly.
     */
    @GetMapping("/public/products/image/{imageName}")
    public ResponseEntity<String> getProductImage(@PathVariable String imageName) {
        return ResponseEntity.status(HttpStatus.GONE)
                .body("This endpoint is deprecated. Images are now served via Cloudinary CDN. " +
                      "Please use the image URL from the product response directly.");
    }
}
