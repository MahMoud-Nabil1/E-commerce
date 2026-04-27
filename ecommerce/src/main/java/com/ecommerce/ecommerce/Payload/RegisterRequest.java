package com.ecommerce.ecommerce.Payload;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.util.Set;

/**
 * Request DTO for the user registration endpoint ({@code POST /api/auth/signup}).
 *
 * <p>All fields are validated using Jakarta Bean Validation constraints.
 * The {@code role} field is optional — if omitted, the user is assigned
 * {@code ROLE_USER} by default.</p>
 */
@Data
public class RegisterRequest {

    /** The desired username (must be unique, 3–20 characters). */
    @NotBlank(message = "Username cannot be blank")
    @Size(min = 3, max = 20)
    private String username;

    /** The user's email address (must be unique and in valid email format). */
    @NotBlank(message = "Email cannot be blank")
    @Email(message = "Invalid email format")
    private String email;

    /** The desired password (6–40 characters, will be BCrypt-hashed before storage). */
    @NotBlank
    @Size(min = 6, max = 40)
    private String password;

    /**
     * Optional set of role names to assign (e.g., {@code "admin"}, {@code "seller"}).
     * Defaults to {@code ROLE_USER} when {@code null} or empty.
     */
    private Set<String> role;
}
