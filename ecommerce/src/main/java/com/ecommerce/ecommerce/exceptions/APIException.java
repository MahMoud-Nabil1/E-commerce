package com.ecommerce.ecommerce.exceptions;

/**
 * Custom runtime exception used to handle general API business logic errors.
 */
public class APIException extends RuntimeException {
    private static final long serialVersionUID = 1L;

    public APIException() {
    }

    public APIException(String message) {
        super(message);
    }
}