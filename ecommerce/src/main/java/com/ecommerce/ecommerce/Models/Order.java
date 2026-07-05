// DB entity: represents a placed order with items, payment, and address.
package com.ecommerce.ecommerce.Models;

import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "orders", indexes = {
        // 1. Optimize fetching order history for a specific customer by email
        @Index(name = "idx_order_email", columnList = "email"),

        // 2. Essential for Admin Dashboard: speed up filtering orders by their status (e.g., PENDING, SHIPPED)
        @Index(name = "idx_order_status", columnList = "order_status"),

        // 3. Optimize sales reports, analytics, and date-range filtering queries
        @Index(name = "idx_order_date", columnList = "order_date"),

        // 4. Optimize JOIN operations and address lookup for shipping logistics
        @Index(name = "idx_order_address", columnList = "address_id"),

        // 5. Optimize JOIN operations for payment verification and auditing
        @Index(name = "idx_order_payment", columnList = "payment_id"),

        // 6. Composite Index: Optimize queries that filter a specific user's orders by status simultaneously
        @Index(name = "idx_email_status", columnList = "email, order_status")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Order {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long orderId;

    @Email
    @Column(nullable = false)
    private String email;

    @OneToMany(mappedBy = "order", cascade = { CascadeType.PERSIST, CascadeType.MERGE })
    private List<OrderItem> orderItems = new ArrayList<>();

    private LocalDate orderDate;

    @OneToOne
    @JoinColumn(name = "payment_id")
    private Payment payment;

    private Double totalAmount;
    private String orderStatus;

    @ManyToOne
    @JoinColumn(name = "address_id")
    private Address address;
}