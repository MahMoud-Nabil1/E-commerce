// DB access for products: category, keyword, seller, and spec-based queries.
package com.ecommerce.ecommerce.Repositories;

import com.ecommerce.ecommerce.Models.Category;
import com.ecommerce.ecommerce.Models.Product;
import com.ecommerce.ecommerce.Models.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long>, JpaSpecificationExecutor<Product> {
    Page<Product> findByCategory(Category category, Pageable pageDetails);

    Page<Product> findByProductNameLikeIgnoreCase(String keyword, Pageable pageDetails);

    // Used by seller dashboard to show only their own products.
    Page<Product> findByUser(User user, Pageable pageDetails);
}
