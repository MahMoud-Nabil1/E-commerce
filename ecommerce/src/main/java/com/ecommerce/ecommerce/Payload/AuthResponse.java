package com.ecommerce.ecommerce.Payload;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * Response DTO returned after successful authentication.
 *
 * <p>Contains the JWT token (for API clients that prefer header-based auth),
 * the authenticated username, the user's roles, and an optional human-readable
 * message.</p>
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class AuthResponse {

    /** The signed JWT token string (may be {@code null} when using cookie-only transport). */
    private String jwtToken;

    /** The authenticated user's username. */
    private String username;

    /** List of role names granted to the user (e.g., {@code ROLE_USER}). */
    private List<String> roles;

    /** An optional human-readable status message. */
    private String message;

    /**
     * Constructs a message-only response (e.g., for error scenarios).
     *
     * @param message the status message
     */
    public AuthResponse(String message) {
        this.message = message;
    }

    /**
     * Constructs a successful authentication response with token and user info.
     *
     * @param jwtToken the signed JWT token
     * @param username the authenticated username
     * @param roles    the user's granted roles
     */
    public AuthResponse(String jwtToken, String username, List<String> roles) {
        this.jwtToken = jwtToken;
        this.username = username;
        this.roles = roles;
    }
}
