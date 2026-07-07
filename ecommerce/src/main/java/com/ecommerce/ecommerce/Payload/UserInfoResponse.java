package com.ecommerce.ecommerce.Payload;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * Response DTO containing the authenticated user's profile information.
 *
 * <p>Returned by the sign-in and user-details endpoints. May optionally
 * include the JWT token string for API clients that prefer header-based
 * authentication over cookies.</p>
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserInfoResponse {

    /** The user's unique database identifier. */
    private Long id;

    /** The signed JWT token (optional Ã¢â‚¬â€ may be {@code null} when using cookie transport). */
    private String jwtToken;

    /** The user's username. */
    private String username;

    /** The user's email address. */
    private String email;

    private String name;
    private String phone;
    private java.time.LocalDate joinedDate;

    /** List of role names assigned to the user (e.g., {@code ["ROLE_USER"]}). */
    private List<String> roles;

    /**
     * Constructs a response with all user profile fields and the JWT token.
     *
     * @param id       the user's database ID
     * @param username the user's username
     * @param roles    the user's assigned role names
     * @param email    the user's email address
     * @param jwtToken the signed JWT token string
     */
    public UserInfoResponse(Long id, String username, List<String> roles, String email, String jwtToken) {
        this.id = id;
        this.username = username;
        this.roles = roles;
        this.email = email;
        this.jwtToken = jwtToken;
    }

    public UserInfoResponse(Long id, String username, List<String> roles, String email, String jwtToken, String name, String phone, java.time.LocalDate joinedDate) {
        this.id = id;
        this.username = username;
        this.roles = roles;
        this.email = email;
        this.jwtToken = jwtToken;
        this.name = name;
        this.phone = phone;
        this.joinedDate = joinedDate;
    }

    /**
     * Constructs a minimal response without email or JWT (used for cookie-based auth).
     *
     * @param id       the user's database ID
     * @param username the user's username
     * @param roles    the user's assigned role names
     */
    public UserInfoResponse(Long id, String username, List<String> roles) {
        this.id = id;
        this.username = username;
        this.roles = roles;
    }
}
