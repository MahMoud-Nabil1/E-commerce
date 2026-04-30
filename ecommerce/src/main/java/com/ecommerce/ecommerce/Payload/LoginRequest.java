package com.ecommerce.ecommerce.Payload;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

/**
 * Request DTO for the user sign-in endpoint ({@code POST /api/auth/signin}).
 *
 * <p>Both fields are validated with {@link NotBlank} to ensure the client
 * provides non-empty credentials.</p>
 */
@Data
public class LoginRequest {

    /** The user's unique username. */
    @NotBlank(message = "Username is required")
    private String username;

    /** The user's plaintext password (never stored Ã¢â‚¬â€ compared against the BCrypt hash). */
    @NotBlank(message = "Password is required")
    private String password;
}
