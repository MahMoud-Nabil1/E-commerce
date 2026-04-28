package com.ecommerce.ecommerce.Repositories;

import com.ecommerce.ecommerce.Models.Category;
import org.springframework.data.jpa.repository.JpaRepository;

/**
 * Repository interface for Category entity database operations.
 */
public interface CategoryRepository extends JpaRepository<Category,Long> {
    Category findByCategoryName(String categoryName);
}