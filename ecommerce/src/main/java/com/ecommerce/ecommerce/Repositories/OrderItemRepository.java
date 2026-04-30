// DB access for order items: inherits standard CRUD from JpaRepository.
package com.ecommerce.ecommerce.Repositories;

import com.ecommerce.ecommerce.Models.OrderItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface OrderItemRepository extends JpaRepository<OrderItem, Long> {
}