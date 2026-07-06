// Core order logic: cart → order conversion, stock, payments.
package com.ecommerce.ecommerce.Services;

import com.ecommerce.ecommerce.exceptions.APIException;
import com.ecommerce.ecommerce.exceptions.ResourceNotFoundException;
import com.ecommerce.ecommerce.Models.*;
import com.ecommerce.ecommerce.Payload.OrderDTO;
import com.ecommerce.ecommerce.Payload.OrderItemDTO;
import com.ecommerce.ecommerce.Payload.OrderResponse;
import com.ecommerce.ecommerce.Repositories.*;
import com.ecommerce.ecommerce.util.AuthUtil;
import jakarta.transaction.Transactional;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class OrderServiceImpl implements OrderService {

    @Autowired
    CartRepository cartRepository;

    @Autowired
    AddressRepository addressRepository;

    @Autowired
    OrderItemRepository orderItemRepository;

    @Autowired
    OrderRepository orderRepository;

    @Autowired
    PaymentRepository paymentRepository;

    @Autowired
    CartService cartService;

    @Autowired
    ModelMapper modelMapper;

    @Autowired
    ProductRepository productRepository;

    @Autowired
    AuthUtil authUtil;

    // Converts user's cart into a persisted order. DB-heavy.
    @Override
    @Transactional
    public OrderDTO placeOrder(String emailId, Long addressId, String paymentMethod, String transactionId) {
        Cart cart = cartRepository.findCartByEmail(emailId);
        if (cart == null) {
            throw new ResourceNotFoundException("Cart", "email", emailId);
        }

        Address address = addressRepository.findById(addressId)
                .orElseThrow(() -> new ResourceNotFoundException("Address", "addressId", addressId));

        Order order = new Order();
        order.setEmail(emailId);
        order.setOrderDate(LocalDate.now());
        order.setTotalAmount(cart.getTotalPrice());
        
        if ("CASH_ON_DELIVERY".equalsIgnoreCase(paymentMethod)) {
            order.setOrderStatus("CONFIRMED");
        } else if ("INSTAPAY".equalsIgnoreCase(paymentMethod) || "VODAFONE_CASH".equalsIgnoreCase(paymentMethod)) {
            if (transactionId == null || transactionId.trim().isEmpty()) {
                throw new APIException("Transaction ID is required for " + paymentMethod);
            }
            order.setOrderStatus("PENDING_PAYMENT");
        } else {
            order.setOrderStatus("PENDING_PAYMENT");
        }
        
        order.setAddress(address);

        // Payment must be saved before order to satisfy FK.
        Payment payment = new Payment(paymentMethod, transactionId, "SUCCESS", "Manual Processing", "ManualGateway");
        payment.setOrder(order);
        payment = paymentRepository.save(payment);
        order.setPayment(payment);

        Order savedOrder = orderRepository.save(order);

        List<CartItem> cartItems = cart.getCartItems();
        if (cartItems.isEmpty()) {
            throw new APIException("Cart is empty");
        }

        // Convert each cart item into an order item.
        List<OrderItem> orderItems = new ArrayList<>();
        for (CartItem cartItem : cartItems) {
            OrderItem orderItem = new OrderItem();
            orderItem.setProduct(cartItem.getProduct());
            orderItem.setQuantity(cartItem.getQuantity());
            orderItem.setDiscount(cartItem.getDiscount());
            orderItem.setOrderedProductPrice(cartItem.getProductPrice());
            orderItem.setOrder(savedOrder);
            orderItems.add(orderItem);
        }

        orderItems = orderItemRepository.saveAll(orderItems);

        // Deduct stock if COD
        if ("CASH_ON_DELIVERY".equalsIgnoreCase(paymentMethod)) {
            cart.getCartItems().forEach(item -> {
                int quantity = item.getQuantity();
                Product product = item.getProduct();

                if (product.getQuantity() < quantity) {
                    throw new com.ecommerce.ecommerce.exceptions.APIException("Product " + product.getProductName() + " is out of stock or insufficient quantity");
                }

                product.setQuantity(product.getQuantity() - quantity);
                productRepository.save(product);
            });
        }
        
        // Clear cart after order is saved.
        cart.getCartItems().forEach(item -> {
            cartService.deleteProductFromCart(cart.getCartId(), item.getProduct().getProductId());
        });

        OrderDTO orderDTO = modelMapper.map(savedOrder, OrderDTO.class);
        orderItems.forEach(item -> orderDTO.getOrderItems().add(modelMapper.map(item, OrderItemDTO.class)));

        orderDTO.setAddressId(addressId);

        return orderDTO;
    }

    @Override
    @Transactional
    public OrderDTO approveOrderPayment(Long orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order", "orderId", orderId));

        if (!"PENDING_PAYMENT".equalsIgnoreCase(order.getOrderStatus())) {
            throw new APIException("Order is not in PENDING_PAYMENT status.");
        }

        // Deduct stock
        order.getOrderItems().forEach(item -> {
            int quantity = item.getQuantity();
            Product product = item.getProduct();

            if (product.getQuantity() < quantity) {
                throw new com.ecommerce.ecommerce.exceptions.APIException("Product " + product.getProductName() + " is out of stock or insufficient quantity");
            }

            product.setQuantity(product.getQuantity() - quantity);
            productRepository.save(product);
        });

        order.setOrderStatus("PAID");
        orderRepository.save(order);

        OrderDTO orderDTO = modelMapper.map(order, OrderDTO.class);
        order.getOrderItems().forEach(item -> orderDTO.getOrderItems().add(modelMapper.map(item, OrderItemDTO.class)));
        orderDTO.setAddressId(order.getAddress().getAddressId());

        return orderDTO;
    }

    // Returns all orders with pagination. Admin-only use.
    @Override
    public OrderResponse getAllOrders(Integer pageNumber, Integer pageSize, String sortBy, String sortOrder) {
        Sort sortByAndOrder = sortOrder.equalsIgnoreCase("asc")
                ? Sort.by(sortBy).ascending()
                : Sort.by(sortBy).descending();
        Pageable pageDetails = PageRequest.of(pageNumber, pageSize, sortByAndOrder);
        Page<Order> pageOrders = orderRepository.findAll(pageDetails);
        List<Order> orders = pageOrders.getContent();
        List<OrderDTO> orderDTOs = orders.stream()
                .map(order -> modelMapper.map(order, OrderDTO.class))
                .toList();
        OrderResponse orderResponse = new OrderResponse();
        orderResponse.setContent(orderDTOs);
        orderResponse.setPageNumber(pageOrders.getNumber());
        orderResponse.setPageSize(pageOrders.getSize());
        orderResponse.setTotalElements(pageOrders.getTotalElements());
        orderResponse.setTotalPages(pageOrders.getTotalPages());
        orderResponse.setLastPage(pageOrders.isLast());
        return orderResponse;
    }

    // Changes order status (e.g. "Shipped", "Delivered").
    @Override
    public OrderDTO updateOrder(Long orderId, String status) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order","orderId",orderId));
        order.setOrderStatus(status);
        orderRepository.save(order);
        return modelMapper.map(order, OrderDTO.class);
    }

    // Filters orders to only those containing seller's products.
    @Override
    public OrderResponse getAllSellerOrders(Integer pageNumber, Integer pageSize, String sortBy, String sortOrder) {
        Sort sortByAndOrder = sortOrder.equalsIgnoreCase("asc")
                ? Sort.by(sortBy).ascending()
                : Sort.by(sortBy).descending();
        Pageable pageDetails = PageRequest.of(pageNumber, pageSize, sortByAndOrder);

        User seller = authUtil.loggedInUser();

        Page<Order> pageOrders = orderRepository.findAll(pageDetails);

        // In-memory filter: keep orders with seller's products.
        List<Order> sellerOrders = pageOrders.getContent().stream()
                .filter(order -> order.getOrderItems().stream()
                        .anyMatch(orderItem -> {
                            var product = orderItem.getProduct();
                            if (product == null || product.getUser() == null) {
                                return false;
                            }
                            return product.getUser().getUserId().equals(
                                    seller.getUserId());
                        }))
                .toList();

        List<OrderDTO> orderDTOs = sellerOrders.stream()
                .map(order -> modelMapper.map(order, OrderDTO.class))
                .toList();
        OrderResponse orderResponse = new OrderResponse();
        orderResponse.setContent(orderDTOs);
        orderResponse.setPageNumber(pageOrders.getNumber());
        orderResponse.setPageSize(pageOrders.getSize());
        orderResponse.setTotalElements(pageOrders.getTotalElements());
        orderResponse.setTotalPages(pageOrders.getTotalPages());
        orderResponse.setLastPage(pageOrders.isLast());
        return orderResponse;
    }

    // Fetches all orders placed by a specific user.
    @Override
    public List<OrderDTO> getOrdersByUser(String emailId) {
        List<Order> orders = orderRepository.findAllByEmail(emailId);
        if (orders.isEmpty()) {
            // Alternatively, return an empty list instead of throwing an exact error, typically better for user-facing UX 
            // but keeping it simple
        }
        return orders.stream()
                .map(order -> {
                    OrderDTO dto = modelMapper.map(order, OrderDTO.class);
                    if (order.getAddress() != null && dto.getAddressId() == null) {
                        dto.setAddressId(order.getAddress().getAddressId());
                    }
                    return dto;
                })
                .collect(Collectors.toList());
    }

    @Override
    public OrderDTO getOrderDetails(Long orderId, String emailId) {
        Order order = orderRepository.findByIdWithDetails(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order", "orderId", orderId));

        User loggedIn = authUtil.loggedInUser();
        boolean isAdmin = loggedIn.getRoles().stream()
                .anyMatch(r -> r.getRoleName().name().equals("ROLE_ADMIN"));

        if (!order.getEmail().equalsIgnoreCase(emailId) && !isAdmin) {
            throw new com.ecommerce.ecommerce.exceptions.APIException("You do not have permission to view this order.");
        }

        OrderDTO orderDTO = modelMapper.map(order, OrderDTO.class);
        if (order.getAddress() != null && orderDTO.getAddressId() == null) {
            orderDTO.setAddressId(order.getAddress().getAddressId());
        }
        return orderDTO;
    }
}
