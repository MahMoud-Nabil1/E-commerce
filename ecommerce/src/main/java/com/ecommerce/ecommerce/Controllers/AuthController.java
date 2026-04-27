package com.ecommerce.ecommerce.Controllers;

import com.ecommerce.ecommerce.Payload.AuthenticationResult;
import com.ecommerce.ecommerce.Payload.LoginRequest;
import com.ecommerce.ecommerce.Payload.MessageResponse;
import com.ecommerce.ecommerce.Payload.RegisterRequest;
import com.ecommerce.ecommerce.Payload.UserInfoResponse;
import com.ecommerce.ecommerce.Services.AuthService;
import com.ecommerce.ecommerce.config.AppConstants;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

/**
 * REST controller handling all authentication-related HTTP endpoints.
 *
 * <p>Maps to {@code /api/auth/**} and delegates business logic entirely
 * to the {@link AuthService} layer, keeping the controller thin and
 * focused on HTTP concerns (status codes, headers, response wrapping).</p>
 *
 * <p>All endpoints that modify state use {@code POST}; read-only queries
 * use {@code GET}.</p>
 */
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    /**
     * Authenticates a user with username/password credentials.
     *
     * <p>On success, sets the JWT as an HttpOnly cookie via the
     * {@code Set-Cookie} response header and returns the user info
     * in the response body.</p>
     *
     * @param loginRequest the login credentials (validated via {@code @Valid})
     * @return a {@link UserInfoResponse} with the JWT cookie attached
     */
    @PostMapping("/signin")
    public ResponseEntity<?> authenticateUser(@Valid @RequestBody LoginRequest loginRequest) {
        AuthenticationResult result = authService.login(loginRequest);

        // Attach the JWT as an HttpOnly cookie in the Set-Cookie header
        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, result.getJwtCookie().toString())
                .body(result.getResponse());
    }

    /**
     * Registers a new user account.
     *
     * @param signUpRequest the registration payload (validated via {@code @Valid})
     * @return a {@link MessageResponse} indicating success, or HTTP 400 if
     *         the username/email is already taken
     */
    @PostMapping("/signup")
    public ResponseEntity<?> registerUser(@Valid @RequestBody RegisterRequest signUpRequest) {
        MessageResponse response = authService.register(signUpRequest);
        return ResponseEntity.ok(response);
    }

    /**
     * Returns the username of the currently authenticated user.
     *
     * @param authentication the current security context (injected by Spring)
     * @return the username string, or an empty string if unauthenticated
     */
    @GetMapping("/username")
    public String currentUserName(Authentication authentication) {
        return authentication != null ? authentication.getName() : "";
    }

    /**
     * Returns the full profile details of the currently authenticated user.
     *
     * @param authentication the current security context (injected by Spring)
     * @return a {@link UserInfoResponse} containing user ID, username, and roles
     */
    @GetMapping("/user")
    public ResponseEntity<?> getUserDetails(Authentication authentication) {
        return ResponseEntity.ok(authService.getCurrentUserDetails(authentication));
    }

    /**
     * Logs the current user out by clearing the JWT cookie.
     *
     * @return a {@link MessageResponse} confirming sign-out, with a cookie-clearing
     *         {@code Set-Cookie} header
     */
    @PostMapping("/signout")
    public ResponseEntity<?> signoutUser() {
        ResponseCookie cookie = authService.logoutUser();
        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, cookie.toString())
                .body(new MessageResponse("You've been signed out!"));
    }

    /**
     * Returns a paginated list of all users with the SELLER role.
     *
     * @param pageNumber the zero-based page index (defaults to {@link AppConstants#PAGE_NUMBER})
     * @return a paginated response of seller data
     */
    @GetMapping("/sellers")
    public ResponseEntity<?> getAllSellers(
            @RequestParam(name = "pageNumber", defaultValue = AppConstants.PAGE_NUMBER, required = false)
            Integer pageNumber) {

        Sort sortByAndOrder = Sort.by(AppConstants.SORT_USERS_BY).descending();
        Pageable pageDetails = PageRequest.of(
                pageNumber,
                Integer.parseInt(AppConstants.PAGE_SIZE),
                sortByAndOrder);

        return ResponseEntity.ok(authService.getAllSellers(pageDetails));
    }
}