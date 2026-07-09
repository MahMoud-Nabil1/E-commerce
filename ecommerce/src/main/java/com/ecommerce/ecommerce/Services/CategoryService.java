// Contract for category listing, creation, update, and deletion.
package com.ecommerce.ecommerce.Services;

import com.ecommerce.ecommerce.Models.Category;
import com.ecommerce.ecommerce.Payload.CategoryDTO;
import com.ecommerce.ecommerce.Payload.CategoryResponse;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

public interface CategoryService {
    CategoryResponse getAllCategories(Integer pageNumber, Integer pageSize, String sortBy, String sortOrder);

    CategoryDTO createCategory(CategoryDTO categoryDTO);

    CategoryDTO deleteCategory(Long categoryId);

    CategoryDTO updateCategory(CategoryDTO categoryDTO, Long categoryId);

    CategoryDTO updateCategoryImage(Long categoryId, MultipartFile image) throws IOException;
}
