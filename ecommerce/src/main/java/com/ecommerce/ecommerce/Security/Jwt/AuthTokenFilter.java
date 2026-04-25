package com.ecommerce.ecommerce.Security.Jwt;

import com.ecommerce.ecommerce.Security.Services.UserDetailsServiceImpl;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

/**
 * Filter class that executes once per request to validate JWT tokens and set user authentication.
 */
@Component
public class AuthTokenFilter extends OncePerRequestFilter {

    @Autowired
    private JwtUtils jwtUtils;

    @Autowired
    private UserDetailsServiceImpl userDetailsService;

    private static final Logger logger = LoggerFactory.getLogger(AuthTokenFilter.class);

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        try {
            // Extract JWT from the Authorization header
            String jwt = parseJwt(request);

            // Validate the token and ensure it is not null
            if (jwt != null && jwtUtils.validateJwtToken(jwt)) {
                // Get username from the validated token
                String username = jwtUtils.getUserNameFromJwtToken(jwt);

                // Load user details from the database
                UserDetails userDetails = userDetailsService.loadUserByUsername(username);

                // Create authentication object
                UsernamePasswordAuthenticationToken authentication =
                        new UsernamePasswordAuthenticationToken(
                                userDetails,
                                null,
                                userDetails.getAuthorities());

                // Build and set authentication details from the request
                authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));

                // Set the authentication in the Security Context
                SecurityContextHolder.getContext().setAuthentication(authentication);
            }
        } catch (Exception e) {
            // Log error if authentication cannot be set
            logger.error("Cannot set user authentication: {}", e);
        }

        // Continue the filter chain
        filterChain.doFilter(request, response);
    }

    /**
     * Helper method to extract the JWT token from the Authorization header.
     */
    private String parseJwt(HttpServletRequest request) {
        String headerAuth = request.getHeader("Authorization");

        // Check if the header contains a Bearer token
        if (StringUtils.hasText(headerAuth) && headerAuth.startsWith("Bearer ")) {
            return headerAuth.substring(7);
        }

        return null;
    }
}