// DB access for orders: inherits standard CRUD from JpaRepository.
package com.ecommerce.ecommerce.Repositories;

import com.ecommerce.ecommerce.Models.Order;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {

    @Query("SELECT DISTINCT o FROM Order o LEFT JOIN FETCH o.orderItems oi LEFT JOIN FETCH oi.product LEFT JOIN FETCH o.payment LEFT JOIN FETCH o.address WHERE o.email = :email ORDER BY o.orderDate DESC, o.orderId DESC")
    List<Order> findAllByEmail(@Param("email") String email);

    @Query("SELECT o FROM Order o LEFT JOIN FETCH o.orderItems oi LEFT JOIN FETCH oi.product LEFT JOIN FETCH o.payment LEFT JOIN FETCH o.address WHERE o.orderId = :orderId")
    Optional<Order> findByIdWithDetails(@Param("orderId") Long orderId);
}