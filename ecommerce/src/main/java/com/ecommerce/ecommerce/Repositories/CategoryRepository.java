// DB access for categories: lookup by name for duplicate detection.
package com.ecommerce.ecommerce.Repositories;

import com.ecommerce.ecommerce.Models.Category;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CategoryRepository extends JpaRepository<Category,Long> {
    Category findByCategoryName(String categoryName);
}
