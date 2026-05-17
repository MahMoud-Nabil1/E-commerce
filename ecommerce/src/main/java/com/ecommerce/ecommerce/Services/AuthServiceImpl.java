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
 * This service is responsible for:
 * <ul>
 * <li>Authenticating users via the Spring Security
 * {@link AuthenticationManager}</li>
 * <li>Creating new user accounts with encoded passwords and resolved roles</li>
 * <li>Generating and clearing JWT cookies for stateless session management</li>
 * <li>Extracting the currently authenticated user's profile from the security
 * context</li>
 * </ul>
 *
 * <p>
 * <strong>Design note:</strong> This service intentionally does <em>not</em>
 * return {@link org.springframework.http.ResponseEntity} — HTTP-layer concerns
 * are the responsibility of the controller.
 * </p>
 */
@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtils jwtUtils;

    /**
     * {@inheritDoc}
     *
     * <p>
     * Flow:
     * <ol>
     * <li>Authenticate credentials via the {@link AuthenticationManager}</li>
     * <li>Inject the resulting {@link Authentication} into the
     * {@link SecurityContextHolder}</li>
     * <li>Generate a signed JWT and wrap it in an HttpOnly cookie</li>
     * <li>Build and return the user info response alongside the cookie</li>
     * </ol>
     */
    @Override
    public AuthenticationResult login(LoginRequest loginRequest) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        loginRequest.getUsername(),
                        loginRequest.getPassword()));

        // Inject authenticated principal into the SecurityContext for the current
        // request
        SecurityContextHolder.getContext().setAuthentication(authentication);

        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();

        ResponseCookie jwtCookie = jwtUtils.generateJwtCookie(userDetails);

        List<String> roles = extractRoleNames(userDetails);
        UserInfoResponse response = new UserInfoResponse(
                userDetails.getId(), userDetails.getUsername(), roles);

        return new AuthenticationResult(jwtCookie, response);
    }

    /**
     * {@inheritDoc}
     *
     * <p>
     * Validates uniqueness of username and email before persisting the new user.
     * Passwords are hashed with the configured {@link PasswordEncoder} (BCrypt)
     * before being stored.
     * </p>
     */
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

        // Never store plaintext passwords.
        user.setPassword(passwordEncoder.encode(signUpRequest.getPassword()));

        Set<String> requestedRoles = signUpRequest.getRole();
        Set<Role> roles = new HashSet<>();

        // Default to ROLE_USER when no role is specified.
        if (requestedRoles == null || requestedRoles.isEmpty()) {
            roles.add(resolveRole(AppRole.ROLE_USER));
        } else {
            requestedRoles.forEach(roleName -> {
                switch (roleName.toLowerCase()) {
                    case "admin" -> roles.add(resolveRole(AppRole.ROLE_ADMIN));
                    case "seller" -> roles.add(resolveRole(AppRole.ROLE_SELLER));
                    default -> roles.add(resolveRole(AppRole.ROLE_USER));
                }
            });
        }

        user.setRoles(roles);
        userRepository.save(user);

        return new MessageResponse("User registered successfully!");
    }

    // Extracts user info from the current security context.
    // Returns null if the authentication is missing or not yet resolved —
    // the controller handles the null case and returns an appropriate response.
    @Override
    public UserInfoResponse getCurrentUserDetails(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()
                || authentication.getPrincipal().equals("anonymousUser")) {
            return null;
        }
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        List<String> roles = extractRoleNames(userDetails);
        return new UserInfoResponse(userDetails.getId(), userDetails.getUsername(), roles);
    }

    // Returns an empty cookie that clears the JWT on logout.
    @Override
    public ResponseCookie logoutUser() {
        return jwtUtils.getCleanJwtCookie();
    }

    // TODO: Implement seller-specific query with role filtering.
    @Override
    @Transactional(readOnly = true)
    public Object getAllSellers(Pageable pageDetails) {
        // JOIN FETCH can't return Page directly — manually count + fetch.
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

    // ======================== Private Helpers ========================

    /**
     * Resolves a {@link Role} entity from the database by its {@link AppRole} enum
     * value.
     *
     * @param appRole the role enum to look up
     * @return the corresponding {@link Role} entity
     * @throws RuntimeException if the role does not exist in the database
     */
    private Role resolveRole(AppRole appRole) {
        return roleRepository.findByRoleName(appRole)
                .orElseThrow(() -> new RuntimeException(
                        "Error: Role is not found — " + appRole.name()));
    }

    /**
     * Extracts a list of role name strings from the authenticated user's
     * authorities.
     *
     * @param userDetails the authenticated user's details
     * @return a list of role names (e.g., {@code ["ROLE_USER", "ROLE_ADMIN"]})
     */
    private List<String> extractRoleNames(UserDetailsImpl userDetails) {
        return userDetails.getAuthorities().stream()
                .map(item -> item.getAuthority())
                .collect(Collectors.toList());
    }
}
