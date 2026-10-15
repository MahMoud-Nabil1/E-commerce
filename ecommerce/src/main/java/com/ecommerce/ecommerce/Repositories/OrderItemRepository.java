// DB access for order items: inherits standard CRUD from JpaRepository.
package com.ecommerce.ecommerce.Repositories;

import com.ecommerce.ecommerce.Models.OrderItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface OrderItemRepository extends JpaRepository<OrderItem, Long> {
    
    @Query("SELECT CASE WHEN COUNT(oi) > 0 THEN true ELSE false END " +
           "FROM OrderItem oi " +
           "WHERE oi.order.email = :email AND oi.product.productId = :productId")
    boolean existsByOrderEmailAndProductId(@Param("email") String email, @Param("productId") Long productId);
}