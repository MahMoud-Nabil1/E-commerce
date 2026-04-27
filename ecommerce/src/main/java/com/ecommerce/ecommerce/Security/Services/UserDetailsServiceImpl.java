package com.ecommerce.ecommerce.Security.Services;

import com.ecommerce.ecommerce.Models.User;
import com.ecommerce.ecommerce.Repositories.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Custom implementation of Spring Security's {@link UserDetailsService}.
 *
 * <p>Responsible for loading user-specific data from the database during the
 * authentication flow. Called automatically by the
 * {@link org.springframework.security.authentication.AuthenticationManager}
 * and explicitly by {@link com.ecommerce.ecommerce.Security.Jwt.AuthTokenFilter}
 * when validating JWT tokens.</p>
 *
 * <p>The method is marked {@link Transactional} so that lazy-loaded
 * associations (e.g., roles) are fetched within the same persistence context.</p>
 */
@Service
@RequiredArgsConstructor
public class UserDetailsServiceImpl implements UserDetailsService {

    private final UserRepository userRepository;

    /**
     * Locates the user based on the given username.
     *
     * @param username the username identifying the user whose data is required
     * @return a fully populated {@link UserDetails} object ({@link UserDetailsImpl})
     * @throws UsernameNotFoundException if no user exists with the given username
     */
    @Override
    @Transactional
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        // Fetch user entity or fail fast with a descriptive exception
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException(
                        "User Not Found with username: " + username));

        // Convert the domain entity into a Spring Security principal
        return UserDetailsImpl.build(user);
    }
}