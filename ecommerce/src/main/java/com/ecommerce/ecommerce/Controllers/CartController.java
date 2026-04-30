// HTTP endpoints for cart operations (add, update, delete items).
package com.ecommerce.ecommerce.Controllers;

import com.ecommerce.ecommerce.Models.Cart;
import com.ecommerce.ecommerce.Payload.CartDTO;
import com.ecommerce.ecommerce.Payload.CartItemDTO;
import com.ecommerce.ecommerce.Repositories.CartRepository;
import com.ecommerce.ecommerce.Services.CartService;
import com.ecommerce.ecommerce.util.AuthUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
public class CartController {

    @Autowired
    private CartRepository cartRepository;

    @Autowired
    private AuthUtil authUtil;

    @Autowired
    private CartService cartService;

    /**
     * What it does: Replaces the entire cart from frontend state (bulk sync). Useful for emptying the cart or syncing offline cart data.
     * What it expects: A list of CartItemDTO objects in the JSON body.
     * What it returns: A plain text string response confirming status with 201 Created.
     */
    @PostMapping("/cart/create")
    public ResponseEntity<String> createOrUpdateCart(@RequestBody List<CartItemDTO> cartItems){
        String response = cartService.createOrUpdateCartWithItems(cartItems);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    /**
     * What it does: Adds a single product to the logged-in user's cart with the specified quantity.
     * What it expects: 'productId' and 'quantity' as URL path variables.
     * What it returns: The updated CartDTO representing the user's cart with 201 Created.
     */
    @PostMapping("/carts/products/{productId}/quantity/{quantity}")
    public ResponseEntity<CartDTO> addProductToCart(@PathVariable Long productId,
                                                    @PathVariable Integer quantity){
        CartDTO cartDTO = cartService.addProductToCart(productId, quantity);
        return new ResponseEntity<CartDTO>(cartDTO, HttpStatus.CREATED);
    }

    /**
     * What it does: Returns all carts in the system. Intended as an admin diagnostic endpoint.
     * What it expects: Admin authorization, no inputs needed.
     * What it returns: A List of all CartDTO objects with 302 FOUND (or 200 OK conceptually).
     */
    @GetMapping("/carts")
    public ResponseEntity<List<CartDTO>> getCarts() {
        List<CartDTO> cartDTOs = cartService.getAllCarts();
        return new ResponseEntity<List<CartDTO>>(cartDTOs, HttpStatus.FOUND);
    }

    /**
     * What it does: Retrieves the logged-in user's own cart and its current items.
     * What it expects: Authentication context (cookie/token).
     * What it returns: The CartDTO representing the user's cart with 200 OK.
     */
    @GetMapping("/carts/users/cart")
    public ResponseEntity<CartDTO> getCartById(){
        String emailId = authUtil.loggedInEmail();
        Cart cart = cartRepository.findCartByEmail(emailId);
        Long cartId = cart.getCartId();
        CartDTO cartDTO = cartService.getCart(emailId, cartId);
        return new ResponseEntity<CartDTO>(cartDTO, HttpStatus.OK);
    }

    /**
     * What it does: Increments or decrements a cart item's quantity by 1.
     * What it expects: 'productId' and 'operation' in the path. "delete" means -1 quantity, anything else means +1.
     * What it returns: The updated CartDTO object with 200 OK.
     */
    @PutMapping("/cart/products/{productId}/quantity/{operation}")
    public ResponseEntity<CartDTO> updateCartProduct(@PathVariable Long productId,
                                                     @PathVariable String operation) {
        // "delete" means -1 quantity, anything else means +1.
        CartDTO cartDTO = cartService.updateProductQuantityInCart(productId,
                operation.equalsIgnoreCase("delete") ? -1 : 1);

        return new ResponseEntity<CartDTO>(cartDTO, HttpStatus.OK);
    }

    /**
     * What it does: Removes a product entirely from a specific cart regardless of quantity.
     * What it expects: 'cartId' and 'productId' as URL path variables.
     * What it returns: A confirmation message string with 200 OK.
     */
    @DeleteMapping("/carts/{cartId}/product/{productId}")
    public ResponseEntity<String> deleteProductFromCart(@PathVariable Long cartId,
                                                        @PathVariable Long productId) {
        String status = cartService.deleteProductFromCart(cartId, productId);

        return new ResponseEntity<String>(status, HttpStatus.OK);
    }
}
