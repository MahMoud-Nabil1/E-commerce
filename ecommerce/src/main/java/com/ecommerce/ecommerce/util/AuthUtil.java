// Extracts logged-in user details from Spring Security context.
package com.ecommerce.ecommerce.util;

import com.ecommerce.ecommerce.Models.User;
import com.ecommerce.ecommerce.Repositories.UserRepository;
import com.ecommerce.ecommerce.Security.Services.UserDetailsImpl;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Component;

/**
 * Utility class to extract authenticated user details from the security context.
 * Optimized for stateless microservices execution by reading claims from
 * the UserDetailsImpl principal when available.
 */
@Component
@RequiredArgsConstructor
public class AuthUtil {

    private final UserRepository userRepository;

    public String loggedInEmail() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.getPrincipal() instanceof UserDetailsImpl userDetails
                && userDetails.getEmail() != null && !userDetails.getEmail().isBlank()) {
            return userDetails.getEmail();
        }

        User user = loggedInUser();
        return user.getEmail();
    }

    public Long loggedInUserId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.getPrincipal() instanceof UserDetailsImpl userDetails
                && userDetails.getId() != null) {
            return userDetails.getId();
        }

        User user = loggedInUser();
        return user.getUserId();
    }

    public User loggedInUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new UsernameNotFoundException("No authenticated user in context");
        }

        User user = userRepository.findByUsername(authentication.getName())
                .orElseThrow(() -> new UsernameNotFoundException(
                        "User Not Found with username: " + authentication.getName()));
        return user;
    }
}
