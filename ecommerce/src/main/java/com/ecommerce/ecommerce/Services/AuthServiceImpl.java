// Login, registration, JWT cookie management, user profile retrieval.
package com.ecommerce.ecommerce.Services;

import com.ecommerce.ecommerce.Models.AppRole;
import com.ecommerce.ecommerce.Models.Role;
import com.ecommerce.ecommerce.Models.User;
import com.ecommerce.ecommerce.Payload.AuthenticationResult;
import com.ecommerce.ecommerce.Payload.LoginRequest;
import com.ecommerce.ecommerce.Payload.MessageResponse;
import com.ecommerce.ecommerce.Payload.RegisterRequest;
import com.ecommerce.ecommerce.Payload.UserInfoResponse;
import com.ecommerce.ecommerce.Repositories.RoleRepository;
import com.ecommerce.ecommerce.Repositories.UserRepository;
import com.ecommerce.ecommerce.Security.Jwt.JwtUtils;
import com.ecommerce.ecommerce.Security.Services.UserDetailsImpl;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseCookie;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.SecureRandom;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

/**
 * Implementation of the {@link AuthService} interface providing authentication,
 * registration, and user management business logic.
 *
 * <p>
 * Adapted with BookaBeeka security patterns:
 * <ul>
 * <li>Cryptographically secure OTP generation (SecureRandom)</li>
 * <li>Timing-attack safe OTP verification (MessageDigest.isEqual)</li>
 * <li>Dual transport tokens (HttpOnly Cookie + response payload for cross-origin / mobile clients)</li>
 * </ul>
 * </p>
 */
@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private static final SecureRandom SECURE_RANDOM = new SecureRandom();

    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtils jwtUtils;
    private final MailService mailService;

    @Override
    public AuthenticationResult login(LoginRequest loginRequest) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        loginRequest.getUsername(),
                        loginRequest.getPassword()));

        // Inject authenticated principal into the SecurityContext for the current request
        SecurityContextHolder.getContext().setAuthentication(authentication);

        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();

        // 1. Generate HttpOnly cookie for web browser session
        ResponseCookie jwtCookie = jwtUtils.generateJwtCookie(userDetails);

        // 2. Generate raw JWT string for authorization header / mobile / cross-origin clients
        String rawJwt = jwtUtils.generateToken(userDetails);

        List<String> roles = extractRoleNames(userDetails);
        UserInfoResponse response = new UserInfoResponse(
                userDetails.getId(), userDetails.getUsername(), roles, userDetails.getEmail(), rawJwt,
                userDetails.getDisplayName(), userDetails.getPhone(), userDetails.getJoinedDate());

        return new AuthenticationResult(jwtCookie, response);
    }

    @Override
    public MessageResponse register(RegisterRequest signUpRequest) {
        if (userRepository.existsByUsername(signUpRequest.getUsername())) {
            throw new com.ecommerce.ecommerce.exceptions.APIException("Error: Username is already taken!");
        }

        if (userRepository.existsByEmail(signUpRequest.getEmail())) {
            throw new com.ecommerce.ecommerce.exceptions.APIException("Error: Email is already in use!");
        }

        User user = new User();
        user.setUsername(signUpRequest.getUsername());
        user.setEmail(signUpRequest.getEmail());

        // Never store plaintext passwords
        user.setPassword(passwordEncoder.encode(signUpRequest.getPassword()));

        // Validate and resolve requested roles.
        // Public registration permits only 'USER' and 'SELLER' roles.
        // Arbitrary roles or attempts to register as 'ADMIN' are explicitly rejected.
        Set<String> requestedRoles = signUpRequest.getRole();
        Set<Role> roles = new HashSet<>();

        if (requestedRoles == null || requestedRoles.isEmpty()) {
            roles.add(resolveRole(AppRole.ROLE_USER));
        } else {
            for (String rawRole : requestedRoles) {
                if (rawRole == null || rawRole.trim().isEmpty()) {
                    continue;
                }
                String normalized = rawRole.trim().toUpperCase();
                if (normalized.startsWith("ROLE_")) {
                    normalized = normalized.substring(5);
                }

                if ("ADMIN".equals(normalized)) {
                    throw new com.ecommerce.ecommerce.exceptions.APIException(
                            "Error: Public registration cannot assign ADMIN privileges.");
                }

                switch (normalized) {
                    case "USER" -> roles.add(resolveRole(AppRole.ROLE_USER));
                    case "SELLER" -> roles.add(resolveRole(AppRole.ROLE_SELLER));
                    default -> throw new com.ecommerce.ecommerce.exceptions.APIException(
                            "Error: Unsupported role requested: " + rawRole
                                    + ". Only 'user' and 'seller' roles are allowed for registration.");
                }
            }

            if (roles.isEmpty()) {
                roles.add(resolveRole(AppRole.ROLE_USER));
            }
        }

        user.setRoles(roles);
        user.setEnabled(true); // Account active immediately upon registration
        user.setProvider("local");

        userRepository.save(user);

        String subject = "Welcome to E-Commerce!";
        String body = "Hi " + user.getUsername() + ",\n\n"
                + "Thank you for creating an account with us!\n"
                + "Your account is active and you can now log in and start shopping.\n";
        mailService.sendMail(user.getEmail(), subject, body);

        return new MessageResponse("User registered successfully!");
    }

    @Override
    public UserInfoResponse getCurrentUserDetails(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()
                || authentication.getPrincipal().equals("anonymousUser")) {
            return null;
        }
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        List<String> roles = extractRoleNames(userDetails);
        return new UserInfoResponse(userDetails.getId(), userDetails.getUsername(), roles, userDetails.getEmail(), null,
                userDetails.getDisplayName(), userDetails.getPhone(), userDetails.getJoinedDate());
    }

    @Override
    public ResponseCookie logoutUser() {
        return jwtUtils.getCleanJwtCookie();
    }

    @Override
    @Transactional(readOnly = true)
    public Object getAllSellers(Pageable pageDetails) {
        long total = userRepository.countByRoleName(AppRole.ROLE_SELLER);
        List<User> sellers = userRepository.findAllByRoleNameWithRoles(AppRole.ROLE_SELLER, pageDetails);

        List<Map<String, Object>> content = sellers.stream().map(user -> {
            Map<String, Object> dto = new HashMap<>();
            dto.put("id", user.getUserId());
            dto.put("username", user.getUsername());
            dto.put("email", user.getEmail());
            dto.put("roles", user.getRoles().stream()
                    .map(role -> role.getRoleName().name())
                    .collect(Collectors.toList()));
            return dto;
        }).collect(Collectors.toList());

        int pageSize = pageDetails.getPageSize();
        int pageNumber = pageDetails.getPageNumber();
        long totalPages = (total + pageSize - 1) / pageSize;

        Map<String, Object> response = new HashMap<>();
        response.put("content", content);
        response.put("totalElements", total);
        response.put("totalPages", totalPages);
        response.put("pageNumber", pageNumber);
        response.put("pageSize", pageSize);
        response.put("lastPage", pageNumber >= totalPages - 1);
        return response;
    }

    @Override
    @Transactional
    public void verifyEmail(String email, String otp) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new com.ecommerce.ecommerce.exceptions.APIException("Error: User not found with email: " + email));

        if (user.isEnabled()) {
            throw new com.ecommerce.ecommerce.exceptions.APIException("Error: Email is already verified.");
        }

        if (user.getEmailVerificationOtp() == null || !safeOtpEquals(user.getEmailVerificationOtp(), otp)) {
            throw new com.ecommerce.ecommerce.exceptions.APIException("Error: Invalid verification OTP.");
        }

        if (user.getEmailVerificationOtpExpiry() == null || user.getEmailVerificationOtpExpiry().isBefore(java.time.LocalDateTime.now())) {
            throw new com.ecommerce.ecommerce.exceptions.APIException("Error: Verification OTP has expired. Please request a new one.");
        }

        user.setEnabled(true);
        user.setEmailVerificationOtp(null);
        user.setEmailVerificationOtpExpiry(null);
        userRepository.save(user);
    }

    @Override
    @Transactional
    public void resendVerificationOtp(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new com.ecommerce.ecommerce.exceptions.APIException("Error: User not found with email: " + email));

        if (user.isEnabled()) {
            throw new com.ecommerce.ecommerce.exceptions.APIException("Error: Email is already verified.");
        }

        String otp = generateOtpCode();
        user.setEmailVerificationOtp(otp);
        user.setEmailVerificationOtpExpiry(java.time.LocalDateTime.now().plusMinutes(15));
        userRepository.save(user);

        String subject = "Verify your E-Commerce account email";
        String body = "Please use the following new 6-digit OTP code to verify your account:\n\n"
                + otp + "\n\n"
                + "This OTP will expire in 15 minutes.";
        mailService.sendMail(user.getEmail(), subject, body);
    }

    @Override
    @Transactional
    public void forgotPassword(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new com.ecommerce.ecommerce.exceptions.APIException("Error: User not found with email: " + email));

        String otp = generateOtpCode();
        user.setPasswordResetOtp(otp);
        user.setPasswordResetOtpExpiry(java.time.LocalDateTime.now().plusMinutes(15));
        userRepository.save(user);

        String subject = "Reset your E-Commerce password";
        String body = "You requested to reset your password.\n\n"
                + "Please use the following 6-digit OTP code to reset your password:\n\n"
                + otp + "\n\n"
                + "This OTP will expire in 15 minutes.\n\n"
                + "If you did not request a password reset, please ignore this email.";
        mailService.sendMail(user.getEmail(), subject, body);
    }

    @Override
    @Transactional
    public void resetPassword(String email, String otp, String newPassword) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new com.ecommerce.ecommerce.exceptions.APIException("Error: User not found with email: " + email));

        if (user.getPasswordResetOtp() == null || !safeOtpEquals(user.getPasswordResetOtp(), otp)) {
            throw new com.ecommerce.ecommerce.exceptions.APIException("Error: Invalid reset OTP.");
        }

        if (user.getPasswordResetOtpExpiry() == null || user.getPasswordResetOtpExpiry().isBefore(java.time.LocalDateTime.now())) {
            throw new com.ecommerce.ecommerce.exceptions.APIException("Error: Reset OTP has expired. Please request a new code.");
        }

        user.setPassword(passwordEncoder.encode(newPassword));
        user.setPasswordResetOtp(null);
        user.setPasswordResetOtpExpiry(null);
        userRepository.save(user);
    }

    // ======================== Private Helpers ========================

    private String generateOtpCode() {
        return String.format("%06d", SECURE_RANDOM.nextInt(1_000_000));
    }

    /**
     * Constant-time comparison to prevent timing attacks on OTP verification.
     * Pattern adapted from BookaBeeka reference.
     */
    private boolean safeOtpEquals(String expected, String actual) {
        if (expected == null || actual == null) {
            return false;
        }
        return MessageDigest.isEqual(
                expected.getBytes(StandardCharsets.UTF_8),
                actual.getBytes(StandardCharsets.UTF_8)
        );
    }

    private Role resolveRole(AppRole appRole) {
        return roleRepository.findByRoleName(appRole)
                .orElseThrow(() -> new RuntimeException(
                        "Error: Role is not found — " + appRole.name()));
    }

    private List<String> extractRoleNames(UserDetailsImpl userDetails) {
        return userDetails.getAuthorities().stream()
                .map(item -> item.getAuthority())
                .collect(Collectors.toList());
    }
}
