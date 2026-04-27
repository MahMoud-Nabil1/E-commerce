package com.ecommerce.ecommerce.config;

/**
 * Application-wide constants for pagination, sorting, and other
 * configurable defaults.
 *
 * <p>Centralizes magic values that would otherwise be scattered across
 * controllers and services, making them easy to find and modify.</p>
 */
public final class AppConstants {

    /** Prevent instantiation — this is a pure constants class. */
    private AppConstants() {
    }

    /** Default zero-based page index for paginated queries. */
    public static final String PAGE_NUMBER = "0";

    /** Default number of items per page. */
    public static final String PAGE_SIZE = "10";

    /** Default sort field for category listings. */
    public static final String SORT_CATEGORIES_BY = "categoryId";

    /** Default sort field for product listings. */
    public static final String SORT_PRODUCTS_BY = "productId";

    /** Default sort direction. */
    public static final String SORT_DIR = "asc";

    /** Default sort field for order listings. */
    public static final String SORT_ORDERS_BY = "totalAmount";

    /** Default sort field for user/seller listings. */
    public static final String SORT_USERS_BY = "userId";
}
