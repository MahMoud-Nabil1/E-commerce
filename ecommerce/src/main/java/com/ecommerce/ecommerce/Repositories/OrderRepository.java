// DB access for orders: inherits standard CRUD from JpaRepository.
package com.ecommerce.ecommerce.Repositories;

import com.ecommerce.ecommerce.Models.Order;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {
    List<Order> findAllByEmail(String email);
}