package com.ecommerce.ecommerce.Payload;

import lombok.AllArgsConstructor;
import lombok.Data;
import org.springframework.http.ResponseCookie;

/**
 * Internal transport object that bundles the JWT cookie with the user info
 * response after a successful authentication.
 *
 * <p>Used exclusively between the service and controller layers —
 * never serialized directly into an HTTP response.</p>
 */
@Data
@AllArgsConstructor
public class AuthenticationResult {

    /** The signed JWT wrapped in an HttpOnly, Secure, SameSite cookie. */
    private ResponseCookie jwtCookie;

    /** The user information response to return in the HTTP body. */
    private UserInfoResponse response;
}
