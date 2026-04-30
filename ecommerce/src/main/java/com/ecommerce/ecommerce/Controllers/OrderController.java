// HTTP endpoints for placing, listing, and updating orders.
package com.ecommerce.ecommerce.Controllers;

import com.ecommerce.ecommerce.config.AppConstants;
import com.ecommerce.ecommerce.Payload.*;
import com.ecommerce.ecommerce.Security.Services.UserDetailsImpl;
import com.ecommerce.ecommerce.Services.OrderService;
import com.ecommerce.ecommerce.Services.StripeService;
import com.ecommerce.ecommerce.util.AuthUtil;
import com.stripe.exception.StripeException;
import com.stripe.model.PaymentIntent;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
public class OrderController {

    @Autowired
    private OrderService orderService;

    @Autowired
    private AuthUtil authUtil;

    @Autowired
    private StripeService stripeService;

    /**
     * What it does: Places an order from the user's current cart and automatically deducts stock.
     * What it expects: The 'paymentMethod' in the URL path, and an OrderRequestDTO in the JSON body containing payment and address details.
     * What it returns: An OrderDTO representing the final processed order with 201 Created.
     */
    @PostMapping("/order/users/payments/{paymentMethod}")
    public ResponseEntity<OrderDTO> orderProducts(@PathVariable String paymentMethod, @RequestBody OrderRequestDTO orderRequestDTO) {
        String emailId = authUtil.loggedInEmail();
        System.out.println("orderRequestDTO DATA: " + orderRequestDTO);
        OrderDTO order = orderService.placeOrder(
                emailId,
                orderRequestDTO.getAddressId(),
                paymentMethod,
                orderRequestDTO.getPgName(),
                orderRequestDTO.getPgPaymentId(),
                orderRequestDTO.getPgStatus(),
                orderRequestDTO.getPgResponseMessage()
        );
        return new ResponseEntity<>(order, HttpStatus.CREATED);
    }

    /**
     * What it does: Creates a Stripe PaymentIntent to initiate the client-facing payment flow.
     * What it expects: A StripePaymentDto containing amount/currency in the JSON body.
     * What it returns: The Stripe 'clientSecret' as a plain string with 201 Created.
     */
    @PostMapping("/order/stripe-client-secret")
    public ResponseEntity<String> createStripeClientSecret(@RequestBody StripePaymentDto stripePaymentDto) throws StripeException {
        System.out.println("StripePaymentDTO Received " + stripePaymentDto);
        PaymentIntent paymentIntent = stripeService.paymentIntent(stripePaymentDto);
        return new ResponseEntity<>(paymentIntent.getClientSecret(), HttpStatus.CREATED);
    }

    /**
     * What it does: Lists all orders across the entire system. Admin-only access.
     * What it expects: Optional pagination parameters ('pageNumber', 'pageSize', 'sortBy', 'sortOrder').
     * What it returns: An OrderResponse containing pagination data and a list of OrderDTOs with 200 OK.
     */
    @GetMapping("/admin/orders")
    public ResponseEntity<OrderResponse> getAllOrders(
            @RequestParam(name = "pageNumber", defaultValue = AppConstants.PAGE_NUMBER, required = false) Integer pageNumber,
            @RequestParam(name = "pageSize", defaultValue = AppConstants.PAGE_SIZE, required = false) Integer pageSize,
            @RequestParam(name = "sortBy", defaultValue = AppConstants.SORT_ORDERS_BY, required = false) String sortBy,
            @RequestParam(name = "sortOrder", defaultValue = AppConstants.SORT_DIR, required = false) String sortOrder
    ) {
        OrderResponse orderResponse = orderService.getAllOrders(pageNumber, pageSize, sortBy, sortOrder);
        return new ResponseEntity<OrderResponse>(orderResponse, HttpStatus.OK);
    }

    /**
     * What it does: Lists orders containing products that belong to the logged-in seller.
     * What it expects: Seller authorization and optional pagination parameters.
     * What it returns: An OrderResponse containing pagination details and orders mapped to the seller, with 200 OK.
     */
    @GetMapping("/seller/orders")
    public ResponseEntity<OrderResponse> getAllSellerOrders(
            @RequestParam(name = "pageNumber", defaultValue = AppConstants.PAGE_NUMBER, required = false) Integer pageNumber,
            @RequestParam(name = "pageSize", defaultValue = AppConstants.PAGE_SIZE, required = false) Integer pageSize,
            @RequestParam(name = "sortBy", defaultValue = AppConstants.SORT_ORDERS_BY, required = false) String sortBy,
            @RequestParam(name = "sortOrder", defaultValue = AppConstants.SORT_DIR, required = false) String sortOrder
    ) {
        OrderResponse orderResponse = orderService.getAllSellerOrders(pageNumber, pageSize, sortBy, sortOrder);
        return new ResponseEntity<OrderResponse>(orderResponse, HttpStatus.OK);
    }

    /**
     * What it does: Updates the status of a specific order (e.g. "Shipped", "Delivered"). Admin access only.
     * What it expects: 'orderId' in the URL and an OrderStatusUpdateDto containing the new status string in the JSON body.
     * What it returns: The updated OrderDTO object with 200 OK.
     */
    @PutMapping("/admin/orders/{orderId}/status")
    public ResponseEntity<OrderDTO> updateOrderStatus(@PathVariable Long orderId,
                                                      @RequestBody OrderStatusUpdateDto orderStatusUpdateDto) {
        OrderDTO order = orderService.updateOrder(orderId, orderStatusUpdateDto.getStatus());
        return new ResponseEntity<OrderDTO>(order, HttpStatus.OK);
    }

    /**
     * What it does: Updates the status of an order for a seller.
     * What it expects: 'orderId' in the URL and an OrderStatusUpdateDto containing the new status string.
     * What it returns: The updated OrderDTO object with 200 OK.
     */
    @PutMapping("/seller/orders/{orderId}/status")
    public ResponseEntity<OrderDTO> updateOrderStatusSeller(@PathVariable Long orderId,
                                                      @RequestBody OrderStatusUpdateDto orderStatusUpdateDto) {
        OrderDTO order = orderService.updateOrder(orderId, orderStatusUpdateDto.getStatus());
        return new ResponseEntity<OrderDTO>(order, HttpStatus.OK);
    }

    /**
     * What it does: Gets all orders that were placed by the currently logged-in user.
     * What it expects: The 'username' in the path (though it uses current auth context securely), no specific body.
     * What it returns: A List of OrderDTO objects representing their order history with 200 OK.
     */
    @GetMapping("/users/{username}/orders")
    public ResponseEntity<List<OrderDTO>> getOrdersByUser(@PathVariable String username) {
        // Technically ignores path variable and securely uses logged-in user's email
        // Or you can validate username if needed. Let's just use the current auth directly.
        String emailId = authUtil.loggedInEmail();
        List<OrderDTO> orders = orderService.getOrdersByUser(emailId);
        return new ResponseEntity<>(orders, HttpStatus.OK);
    }
}
