package com.ecommerce.ecommerce.Models;

/**
 * Enumeration of all application-level security roles.
 *
 * <p>Values follow the Spring Security convention of prefixing role names
 * with {@code ROLE_}, which enables seamless integration with
 * {@code @PreAuthorize("hasRole('USER')")} and similar expressions.</p>
 *
 * @see Role
 */
public enum AppRole {

    /** Standard end-user with basic shopping permissions. */
    ROLE_USER,

    /** Seller with permissions to manage products and orders. */
    ROLE_SELLER,

    /** Administrator with full system access. */
    ROLE_ADMIN
}
