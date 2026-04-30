// Loads user from DB for Spring Security authentication pipeline.
package com.ecommerce.ecommerce.Security.Services;

import com.ecommerce.ecommerce.Models.User;
import com.ecommerce.ecommerce.Repositories.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class UserDetailsServiceImpl implements UserDetailsService {

    private final UserRepository userRepository;

    // Transactional so lazy-loaded roles are fetched in same session.
    @Override
    @Transactional
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException(
                        "User Not Found with username: " + username));

        return UserDetailsImpl.build(user);
    }
}
