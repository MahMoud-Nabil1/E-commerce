// Shopping cart logic: add, update, remove items, sync prices.
package com.ecommerce.ecommerce.Services;

import com.ecommerce.ecommerce.exceptions.APIException;
import com.ecommerce.ecommerce.exceptions.ResourceNotFoundException;
import com.ecommerce.ecommerce.Models.Cart;
import com.ecommerce.ecommerce.Models.CartItem;
import com.ecommerce.ecommerce.Models.Product;
import com.ecommerce.ecommerce.Payload.CartDTO;
import com.ecommerce.ecommerce.Payload.CartItemDTO;
import com.ecommerce.ecommerce.Payload.ProductDTO;
import com.ecommerce.ecommerce.Repositories.CartItemRepository;
import com.ecommerce.ecommerce.Repositories.CartRepository;
import com.ecommerce.ecommerce.Repositories.ProductRepository;
import com.ecommerce.ecommerce.util.AuthUtil;
import jakarta.transaction.Transactional;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;
import java.util.stream.Stream;

@Service
public class CartServiceImpl implements CartService{
    @Autowired
    private CartRepository cartRepository;

    @Autowired
    private AuthUtil authUtil;

    @Autowired
    ProductRepository productRepository;

    @Autowired
    CartItemRepository cartItemRepository;

    @Autowired
    ModelMapper modelMapper;

    // Adds a product to the logged-in user's cart. Creates cart if needed.
    @Transactional
    @Override
    public CartDTO addProductToCart(Long productId, Integer quantity) {
        Cart cart  = createCart();

        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product", "productId", productId));

        CartItem cartItem = cartItemRepository.findCartItemByProductIdAndCartId(cart.getCartId(), productId);

        // Prevent duplicate products; user should update quantity instead.
        if (cartItem != null) {
            throw new APIException("Product " + product.getProductName() + " already exists in the cart");
        }

        if (product.getQuantity() == 0) {
            throw new APIException(product.getProductName() + " is not available");
        }

        if (product.getQuantity() < quantity) {
            throw new APIException("Please, make an order of the " + product.getProductName()
                    + " less than or equal to the quantity " + product.getQuantity() + ".");
        }

        CartItem newCartItem = new CartItem();

        newCartItem.setProduct(product);
        newCartItem.setCart(cart);
        newCartItem.setQuantity(quantity);
        newCartItem.setDiscount(product.getDiscount());
        // Uses specialPrice so discounts are reflected.
        newCartItem.setProductPrice(product.getSpecialPrice());

        cartItemRepository.save(newCartItem);

        cart.setTotalPrice(cart.getTotalPrice() + (product.getSpecialPrice() * quantity));
        cart.getCartItems().add(newCartItem);

        cartRepository.save(cart);

        CartDTO cartDTO = modelMapper.map(cart, CartDTO.class);

        List<CartItem> cartItems = cart.getCartItems();

        Stream<ProductDTO> productStream = cartItems.stream().map(item -> {
            ProductDTO map = modelMapper.map(item.getProduct(), ProductDTO.class);
            map.setQuantity(item.getQuantity());
            return map;
        });

        cartDTO.setProducts(productStream.toList());

        return cartDTO;
    }

    // Returns all carts in the system. Admin diagnostic use.
    @Override
    public List<CartDTO> getAllCarts() {
        List<Cart> carts = cartRepository.findAll();

        if (carts.size() == 0) {
            throw new APIException("No cart exists");
        }

        List<CartDTO> cartDTOs = carts.stream().map(cart -> {
            CartDTO cartDTO = modelMapper.map(cart, CartDTO.class);

            List<ProductDTO> products = cart.getCartItems().stream().map(cartItem -> {
                ProductDTO productDTO = modelMapper.map(cartItem.getProduct(), ProductDTO.class);
                // Cart quantity differs from product stock quantity.
                productDTO.setQuantity(cartItem.getQuantity());
                return productDTO;
            }).collect(Collectors.toList());


            cartDTO.setProducts(products);

            return cartDTO;

        }).collect(Collectors.toList());

        return cartDTOs;
    }

    // Gets a specific user's cart by email and cart ID.
    @Override
    public CartDTO getCart(String emailId, Long cartId) {
        Cart cart = cartRepository.findCartByEmailAndCartId(emailId, cartId);
        if (cart == null){
            throw new ResourceNotFoundException("Cart", "cartId", cartId);
        }
        CartDTO cartDTO = modelMapper.map(cart, CartDTO.class);
        cart.getCartItems().forEach(c ->
                c.getProduct().setQuantity(c.getQuantity()));
        List<ProductDTO> products = cart.getCartItems().stream()
                .map(p -> modelMapper.map(p.getProduct(), ProductDTO.class))
                .toList();
        cartDTO.setProducts(products);
        return cartDTO;
    }

    // Adjusts item quantity by delta (+1 or -1 from frontend).
    @Transactional
    @Override
    public CartDTO updateProductQuantityInCart(Long productId, Integer quantity) {

        String emailId = authUtil.loggedInEmail();
        Cart userCart = cartRepository.findCartByEmail(emailId);
        Long cartId  = userCart.getCartId();

        Cart cart = cartRepository.findById(cartId)
                .orElseThrow(() -> new ResourceNotFoundException("Cart", "cartId", cartId));

        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product", "productId", productId));

        if (product.getQuantity() == 0) {
            throw new APIException(product.getProductName() + " is not available");
        }

        if (product.getQuantity() < quantity) {
            throw new APIException("Please, make an order of the " + product.getProductName()
                    + " less than or equal to the quantity " + product.getQuantity() + ".");
        }

        CartItem cartItem = cartItemRepository.findCartItemByProductIdAndCartId(cartId, productId);

        if (cartItem == null) {
            throw new APIException("Product " + product.getProductName() + " not available in the cart!!!");
        }

        int newQuantity = cartItem.getQuantity() + quantity;

        if (newQuantity < 0) {
            throw new APIException("The resulting quantity cannot be negative.");
        }

        // Auto-remove item when quantity reaches zero.
        if (newQuantity == 0){
            deleteProductFromCart(cartId, productId);
        } else {
            // Snapshot old item total before updating price/quantity.
            double oldItemTotalPrice = cartItem.getProductPrice() * cartItem.getQuantity();

            // Update item with latest product pricing.
            cartItem.setProductPrice(product.getSpecialPrice());
            cartItem.setQuantity(newQuantity);
            cartItem.setDiscount(product.getDiscount());

            double newItemTotalPrice = cartItem.getProductPrice() * cartItem.getQuantity();

            // Correct cart total: remove old contribution, add new.
            cart.setTotalPrice(cart.getTotalPrice() - oldItemTotalPrice + newItemTotalPrice);
            cartRepository.save(cart);
        }

        CartItem updatedItem = cartItemRepository.save(cartItem);
        if(updatedItem.getQuantity() == 0){
            cartItemRepository.deleteById(updatedItem.getCartItemId());
        }


        CartDTO cartDTO = modelMapper.map(cart, CartDTO.class);

        List<CartItem> cartItems = cart.getCartItems();

        Stream<ProductDTO> productStream = cartItems.stream().map(item -> {
            ProductDTO prd = modelMapper.map(item.getProduct(), ProductDTO.class);
            prd.setQuantity(item.getQuantity());
            return prd;
        });


        cartDTO.setProducts(productStream.toList());

        return cartDTO;
    }


    // Gets or creates a cart for the logged-in user.
    private Cart createCart() {
        Cart userCart  = cartRepository.findCartByEmail(authUtil.loggedInEmail());
        if(userCart != null){
            return userCart;
        }

        Cart cart = new Cart();
        cart.setTotalPrice(0.00);
        cart.setUser(authUtil.loggedInUser());
        Cart newCart =  cartRepository.save(cart);

        return newCart;
    }


    // Removes one product from cart and adjusts total price.
    @Transactional
    @Override
    public String deleteProductFromCart(Long cartId, Long productId) {
        Cart cart = cartRepository.findById(cartId)
                .orElseThrow(() -> new ResourceNotFoundException("Cart", "cartId", cartId));

        CartItem cartItem = cartItemRepository.findCartItemByProductIdAndCartId(cartId, productId);

        if (cartItem == null) {
            throw new ResourceNotFoundException("Product", "productId", productId);
        }

        cart.setTotalPrice(cart.getTotalPrice() -
                (cartItem.getProductPrice() * cartItem.getQuantity()));

        cartItemRepository.deleteCartItemByProductIdAndCartId(cartId, productId);

        return "Product " + cartItem.getProduct().getProductName() + " removed from the cart !!!";
    }


    // Syncs cart item price when product price changes.
    @Override
    public void updateProductInCarts(Long cartId, Long productId) {
        Cart cart = cartRepository.findById(cartId)
                .orElseThrow(() -> new ResourceNotFoundException("Cart", "cartId", cartId));

        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product", "productId", productId));

        CartItem cartItem = cartItemRepository.findCartItemByProductIdAndCartId(cartId, productId);

        if (cartItem == null) {
            throw new APIException("Product " + product.getProductName() + " not available in the cart!!!");
        }

        // Recalculate: remove old price, apply new price.
        double cartPrice = cart.getTotalPrice()
                - (cartItem.getProductPrice() * cartItem.getQuantity());

        cartItem.setProductPrice(product.getSpecialPrice());

        cart.setTotalPrice(cartPrice
                + (cartItem.getProductPrice() * cartItem.getQuantity()));

        cartItem = cartItemRepository.save(cartItem);
    }

    // Replaces entire cart contents from frontend state (bulk sync).
    @Transactional
    @Override
    public String createOrUpdateCartWithItems(List<CartItemDTO> cartItems) {
        String emailId = authUtil.loggedInEmail();

        Cart existingCart = cartRepository.findCartByEmail(emailId);
        if (existingCart == null) {
            existingCart = new Cart();
            existingCart.setTotalPrice(0.00);
            existingCart.setUser(authUtil.loggedInUser());
            existingCart = cartRepository.save(existingCart);
        } else {
            // Wipe existing items before replacing with new ones.
            cartItemRepository.deleteAllByCartId(existingCart.getCartId());
        }

        double totalPrice = 0.00;

        for (CartItemDTO cartItemDTO : cartItems) {
            Long productId = cartItemDTO.getProductId();
            Integer quantity = cartItemDTO.getQuantity();

            Product product = productRepository.findById(productId)
                    .orElseThrow(() -> new ResourceNotFoundException("Product", "productId", productId));

            totalPrice += product.getSpecialPrice() * quantity;

            CartItem cartItem = new CartItem();
            cartItem.setProduct(product);
            cartItem.setCart(existingCart);
            cartItem.setQuantity(quantity);
            cartItem.setProductPrice(product.getSpecialPrice());
            cartItem.setDiscount(product.getDiscount());
            cartItemRepository.save(cartItem);
        }

        existingCart.setTotalPrice(totalPrice);
        cartRepository.save(existingCart);
        return "Cart created/updated with the new items successfully";
    }

}
