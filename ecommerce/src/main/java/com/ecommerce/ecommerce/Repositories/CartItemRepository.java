// DB access for cart items: find, delete by cart+product composite key.
package com.ecommerce.ecommerce.Repositories;

import com.ecommerce.ecommerce.Models.CartItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;

public interface CartItemRepository extends JpaRepository<CartItem, Long> {
    @Query("SELECT ci FROM CartItem ci WHERE ci.cart.cartId = ?1 AND ci.product.productId = ?2")
    CartItem findCartItemByProductIdAndCartId(Long cartId, Long productId);

    @Modifying
    @Query("DELETE FROM CartItem ci WHERE ci.cart.cartId = ?1 AND ci.product.productId = ?2")
    void deleteCartItemByProductIdAndCartId(Long cartId, Long productId);

    // Bulk delete used when replacing cart contents entirely.
    @Modifying
    @Query("DELETE FROM CartItem ci WHERE ci.cart.cartId = ?1")
    void deleteAllByCartId(Long cartId);
}
