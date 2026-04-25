package com.ecommerce.ecommerce.Security.Services;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.ecommerce.ecommerce.Models.User;
import com.ecommerce.ecommerce.Repositories.UserRepository;

/**
 * Custom implementation of the Spring Security UserDetailsService interface.
 * This service is responsible for retrieving user-related data from the database.
 */
@Service
public class UserDetailsServiceImpl implements UserDetailsService {

    @Autowired
    UserRepository userRepository;

    /**
     * Locates the user based on the username.
     * * @param username the username identifying the user whose data is required.
     * @return a fully populated UserDetails object (UserDetailsImpl).
     * @throws UsernameNotFoundException if the user could not be found.
     */
    @Override
    @Transactional
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        // Fetch user from database or throw exception if not found
        User user = userRepository.findByUserName(username)
                .orElseThrow(() -> new UsernameNotFoundException("User Not Found with username: " + username));

        // Build and return the UserDetails object from the User entity
        return UserDetailsImpl.build(user);
    }
}