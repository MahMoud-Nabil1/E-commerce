package com.ecommerce.ecommerce.Services;

import com.ecommerce.ecommerce.Payload.AuthenticationResult;
import com.ecommerce.ecommerce.Payload.LoginRequest;
import com.ecommerce.ecommerce.Payload.MessageResponse;
import com.ecommerce.ecommerce.Payload.RegisterRequest;
import com.ecommerce.ecommerce.Payload.UserInfoResponse;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseCookie;
import org.springframework.security.core.Authentication;

/**
 * Service interface defining the contract for all authentication and
 * identity-related operations.
 *
 * <p>This interface is intentionally free of HTTP concepts
 * ({@link org.springframework.http.ResponseEntity}) to maintain a clean
 * separation between the service and presentation layers.</p>
 *
 * @see AuthServiceImpl
 */
public interface AuthService {

    /**
     * Authenticates a user with the provided credentials and generates a JWT cookie.
     *
     * @param loginRequest the login credentials (username and password)
     * @return an {@link AuthenticationResult} containing the JWT cookie and user info
     */
    AuthenticationResult login(LoginRequest loginRequest);

    /**
     * Registers a new user account with the specified details and roles.
     *
     * @param signUpRequest the registration payload containing username, email,
     *                      password, and optional role set
     * @return a {@link MessageResponse} indicating successful registration
     * @throws RuntimeException if the username or email is already taken,
     *                          or if a required role is not found in the database
     */
    MessageResponse register(RegisterRequest signUpRequest);

    /**
     * Retrieves the profile details of the currently authenticated user.
     *
     * @param authentication the current Spring Security {@link Authentication} context
     * @return a {@link UserInfoResponse} containing user ID, username, and roles
     */
    UserInfoResponse getCurrentUserDetails(Authentication authentication);

    /**
     * Generates a cookie that clears the JWT, effectively logging the user out.
     *
     * @return a {@link ResponseCookie} with {@code maxAge=0} that instructs the
     *         browser to delete the JWT cookie
     */
    ResponseCookie logoutUser();

    /**
     * Retrieves a paginated list of all users with the SELLER role.
     *
     * @param pageDetails the pagination and sorting parameters
     * @return the paginated seller data (implementation-specific return type)
     */
    Object getAllSellers(Pageable pageDetails);
}