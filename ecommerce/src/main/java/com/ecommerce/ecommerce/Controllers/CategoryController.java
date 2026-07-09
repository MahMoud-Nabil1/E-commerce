// HTTP endpoints for category browsing and admin management.
package com.ecommerce.ecommerce.Controllers;

import com.ecommerce.ecommerce.config.AppConstants;
import com.ecommerce.ecommerce.Payload.CategoryDTO;
import com.ecommerce.ecommerce.Payload.CategoryResponse;
import com.ecommerce.ecommerce.Services.CategoryService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

@RestController
@RequestMapping("/api")
public class CategoryController {

    @Autowired
    private CategoryService categoryService;

    /**
     * What it does: Lists all categories with support for pagination and sorting. Publicly accessible.
     * What it expects: Optional query parameters: 'pageNumber', 'pageSize', 'sortBy', and 'sortOrder'.
     * What it returns: A CategoryResponse containing pagination metadata and a list of CategoryDTO objects with 200 OK.
     */
    @GetMapping("/public/categories")
    public ResponseEntity<CategoryResponse> getAllCategories(
            @RequestParam(name = "pageNumber", defaultValue = AppConstants.PAGE_NUMBER, required = false) Integer pageNumber,
            @RequestParam(name = "pageSize", defaultValue = AppConstants.PAGE_SIZE, required = false) Integer pageSize,
            @RequestParam(name = "sortBy", defaultValue = AppConstants.SORT_CATEGORIES_BY, required = false) String sortBy,
            @RequestParam(name = "sortOrder", defaultValue = AppConstants.SORT_DIR, required = false) String sortOrder) {
        CategoryResponse categoryResponse = categoryService.getAllCategories(pageNumber, pageSize, sortBy, sortOrder);
        return new ResponseEntity<>(categoryResponse, HttpStatus.OK);
    }

    /**
     * What it does: Creates a new product category. Admin access only.
     * What it expects: A CategoryDTO object in the JSON body containing category details.
     * What it returns: The saved CategoryDTO object including its generated ID with 201 Created.
     */
    @PostMapping("/admin/categories")
    public ResponseEntity<CategoryDTO> createCategory(@Valid @RequestBody CategoryDTO categoryDTO) {
        CategoryDTO savedCategoryDTO = categoryService.createCategory(categoryDTO);
        return new ResponseEntity<>(savedCategoryDTO, HttpStatus.CREATED);
    }

    /**
     * What it does: Deletes an existing category by its ID. Admin access only.
     * What it expects: The 'categoryId' as a URL path variable.
     * What it returns: The deleted CategoryDTO object as confirmation with 200 OK.
     */
    @DeleteMapping("/admin/categories/{categoryId}")
    public ResponseEntity<CategoryDTO> deleteCategory(@PathVariable Long categoryId) {
        CategoryDTO deletedCategory = categoryService.deleteCategory(categoryId);
        return new ResponseEntity<>(deletedCategory, HttpStatus.OK);
    }

    /**
     * What it does: Updates an existing category's information (like its name). Admin access only.
     * What it expects: The 'categoryId' in the URL path, and a CategoryDTO with updated data in the JSON body.
     * What it returns: The updated CategoryDTO object with 200 OK.
     */
    @PutMapping("/admin/categories/{categoryId}")
    public ResponseEntity<CategoryDTO> updateCategory(@Valid @RequestBody CategoryDTO categoryDTO,
            @PathVariable Long categoryId) {
        CategoryDTO savedCategoryDTO = categoryService.updateCategory(categoryDTO, categoryId);
        return new ResponseEntity<>(savedCategoryDTO, HttpStatus.OK);
    }

    /**
     * What it does: Uploads or updates the image for a specific category. Admin access only.
     * What it expects: The 'categoryId' in the URL path, and a multipart file with key 'image'.
     * What it returns: The updated CategoryDTO object including the new image filename with 200 OK.
     */
    @PutMapping("/admin/categories/{categoryId}/image")
    public ResponseEntity<CategoryDTO> updateCategoryImage(@PathVariable Long categoryId,
            @RequestParam("image") MultipartFile image) throws IOException {
        CategoryDTO updatedCategory = categoryService.updateCategoryImage(categoryId, image);
        return new ResponseEntity<>(updatedCategory, HttpStatus.OK);
    }
}
