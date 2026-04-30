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

import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtils jwtUtils;

    // Verifies credentials, sets security context, returns JWT cookie.
    @Override
    public AuthenticationResult login(LoginRequest loginRequest) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        loginRequest.getUsername(),
                        loginRequest.getPassword()));

        // Required so downstream code can access the authenticated user.
        SecurityContextHolder.getContext().setAuthentication(authentication);

        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();

        ResponseCookie jwtCookie = jwtUtils.generateJwtCookie(userDetails);

        List<String> roles = extractRoleNames(userDetails);
        UserInfoResponse response = new UserInfoResponse(
                userDetails.getId(), userDetails.getUsername(), roles);

        return new AuthenticationResult(jwtCookie, response);
    }

    // Creates a new user with hashed password and resolved roles.
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
    @Override
    public UserInfoResponse getCurrentUserDetails(Authentication authentication) {
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
    public Object getAllSellers(Pageable pageDetails) {
        return "Sellers list logic will be implemented here";
    }

    // Looks up a Role entity from DB by its enum value.
    private Role resolveRole(AppRole appRole) {
        return roleRepository.findByRoleName(appRole)
                .orElseThrow(() -> new RuntimeException(
                        "Error: Role is not found — " + appRole.name()));
    }

    // Converts authorities to simple role name strings.
    private List<String> extractRoleNames(UserDetailsImpl userDetails) {
        return userDetails.getAuthorities().stream()
                .map(item -> item.getAuthority())
                .collect(Collectors.toList());
    }
}
