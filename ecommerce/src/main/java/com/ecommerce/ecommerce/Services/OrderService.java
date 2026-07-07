// Contract for order placement, listing, and status updates.
package com.ecommerce.ecommerce.Services;

import com.ecommerce.ecommerce.Payload.OrderDTO;
import com.ecommerce.ecommerce.Payload.OrderResponse;
import jakarta.transaction.Transactional;

import java.util.List;

public interface OrderService {
    @Transactional
    OrderDTO placeOrder(String emailId, Long addressId, String paymentMethod, String transactionId);

    @Transactional
    OrderDTO approveOrderPayment(Long orderId);

    OrderResponse getAllOrders(Integer pageNumber, Integer pageSize, String sortBy, String sortOrder);

    OrderDTO updateOrder(Long orderId, String status);

    OrderResponse getAllSellerOrders(Integer pageNumber, Integer pageSize, String sortBy, String sortOrder);

    List<OrderDTO> getOrdersByUser(String emailId);

    OrderDTO getOrderDetails(Long orderId, String emailId);
}
