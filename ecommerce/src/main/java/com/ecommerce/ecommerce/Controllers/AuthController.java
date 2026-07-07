// HTTP endpoints for login, signup, logout, and user info.
package com.ecommerce.ecommerce.Controllers;

import com.ecommerce.ecommerce.Payload.AuthenticationResult;
import com.ecommerce.ecommerce.Payload.LoginRequest;
import com.ecommerce.ecommerce.Payload.MessageResponse;
import com.ecommerce.ecommerce.Payload.RegisterRequest;
import com.ecommerce.ecommerce.Payload.UserInfoResponse;
import com.ecommerce.ecommerce.Payload.VerifyEmailRequest;
import com.ecommerce.ecommerce.Payload.ForgotPasswordRequest;
import com.ecommerce.ecommerce.Payload.ResetPasswordRequest;
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

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    /**
     * What it does: Authenticates a user and sets a JWT cookie in the response header.
     * What it expects: A LoginRequest containing username and password in the JSON body.
     * What it returns: A UserInfoResponse with user details, and a Set-Cookie header with the JWT token.
     */
    @PostMapping("/login")
    public ResponseEntity<?> authenticateUser(@Valid @RequestBody LoginRequest loginRequest) {
        AuthenticationResult result = authService.login(loginRequest);

        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, result.getJwtCookie().toString())
                .body(result.getResponse());
    }

    /**
     * What it does: Registers a new user in the system. Throws an error if username or email is taken.
     * What it expects: A RegisterRequest containing username, email, password, and optionally a set of roles.
     * What it returns: A MessageResponse confirming successful registration with 200 OK.
     */
    @PostMapping("/signup")
    public ResponseEntity<?> registerUser(@Valid @RequestBody RegisterRequest signUpRequest) {
        MessageResponse response = authService.register(signUpRequest);
        return ResponseEntity.ok(response);
    }

    /**
     * What it does: Returns the current authenticated user's username from the security context.
     * What it expects: Authentication context (cookie/token).
     * What it returns: The username as a plain string, or an empty string if unauthenticated.
     */
    @GetMapping("/username")
    public String currentUserName(Authentication authentication) {
        return authentication != null ? authentication.getName() : "";
    }

    /**
     * What it does: Returns the full profile details (ID, username, roles) of the logged-in user.
     * What it expects: Authentication context (cookie/token).
     * What it returns: A UserInfoResponse object wrapped in a 200 OK, or 401 if not authenticated.
     */
    @GetMapping("/user")
    public ResponseEntity<?> getUserDetails(Authentication authentication) {
        UserInfoResponse response = authService.getCurrentUserDetails(authentication);
        if (response == null) {
            return ResponseEntity.status(401).body(new MessageResponse("Not authenticated"));
        }
        return ResponseEntity.ok(response);
    }

    /**
     * What it does: Clears the JWT cookie, effectively logging out the user.
     * What it expects: No parameters, just a POST request to this endpoint.
     * What it returns: A MessageResponse confirming logout, and clears the JWT cookie in the response header.
     */
    @PostMapping("/signout")
    public ResponseEntity<?> signoutUser() {
        ResponseCookie cookie = authService.logoutUser();
        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, cookie.toString())
                .body(new MessageResponse("You've been signed out!"));
    }

    /**
     * What it does: Lists all user accounts that have the SELLER role, with pagination.
     * What it expects: Optional 'pageNumber' query parameter (defaults to configured constant).
     * What it returns: A paginated list of sellers with 200 OK.
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

    /**
     * What it does: Verifies user's email using OTP code sent on sign up.
     * What it expects: A VerifyEmailRequest containing email and otp.
     * What it returns: A MessageResponse indicating successful verification.
     */
    @PostMapping("/verify-email")
    public ResponseEntity<?> verifyEmail(@Valid @RequestBody VerifyEmailRequest request) {
        authService.verifyEmail(request.getEmail(), request.getOtp());
        return ResponseEntity.ok(new MessageResponse("Email verified successfully! You can now log in."));
    }

    /**
     * What it does: Resends email verification OTP code to the registered email.
     * What it expects: A ForgotPasswordRequest containing email.
     * What it returns: A MessageResponse confirming OTP has been resent.
     */
    @PostMapping("/resend-verification")
    public ResponseEntity<?> resendVerification(@Valid @RequestBody ForgotPasswordRequest request) {
        authService.resendVerificationOtp(request.getEmail());
        return ResponseEntity.ok(new MessageResponse("A new verification OTP has been sent to your email."));
    }

    /**
     * What it does: Requests a password reset OTP code.
     * What it expects: A ForgotPasswordRequest containing email.
     * What it returns: A MessageResponse confirming OTP has been sent.
     */
    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@Valid @RequestBody ForgotPasswordRequest request) {
        authService.forgotPassword(request.getEmail());
        return ResponseEntity.ok(new MessageResponse("Password reset OTP has been sent to your email."));
    }

    /**
     * What it does: Resets user's password using reset OTP code.
     * What it expects: A ResetPasswordRequest containing email, otp, and newPassword.
     * What it returns: A MessageResponse confirming password has been reset.
     */
    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@Valid @RequestBody ResetPasswordRequest request) {
        authService.resetPassword(request.getEmail(), request.getOtp(), request.getNewPassword());
        return ResponseEntity.ok(new MessageResponse("Password reset successfully! You can now log in with your new password."));
    }
}
