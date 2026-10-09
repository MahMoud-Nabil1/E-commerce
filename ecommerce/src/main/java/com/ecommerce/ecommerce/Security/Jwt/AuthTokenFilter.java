// Intercepts every request to extract and validate JWT tokens.
package com.ecommerce.ecommerce.Security.Jwt;

import com.ecommerce.ecommerce.Security.Services.UserDetailsImpl;
import com.ecommerce.ecommerce.Security.Services.UserDetailsServiceImpl;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;

/**
 * Stateless JWT filter adapted for microservices architecture.
 *
 * <p>
 * Validates incoming tokens and constructs the authenticated SecurityContext
 * principal directly from JWT claims (username, ID, email, roles).
 * This eliminates the expensive per-request database query overhead and allows
 * distributed microservices to validate requests independently.
 * </p>
 */
@Component
@RequiredArgsConstructor
public class AuthTokenFilter extends OncePerRequestFilter {

    private final JwtUtils jwtUtils;
    private final UserDetailsServiceImpl userDetailsService;

    private static final Logger logger = LoggerFactory.getLogger(AuthTokenFilter.class);

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {
        String jwt = parseJwt(request);

        if (jwt != null) {
            try {
                if (jwtUtils.validateJwtToken(jwt)) {
                    String username = jwtUtils.getUserNameFromJwtToken(jwt);
                    List<String> roles = jwtUtils.getRolesFromJwtToken(jwt);
                    Long userId = jwtUtils.getUserIdFromJwtToken(jwt);
                    String email = jwtUtils.getEmailFromJwtToken(jwt);

                    UserDetails userDetails;
                    // If roles are present in the JWT, construct principal statelessly
                    if (roles != null && !roles.isEmpty()) {
                        List<SimpleGrantedAuthority> authorities = roles.stream()
                                .map(r -> r.startsWith("ROLE_") ? r : "ROLE_" + r)
                                .map(SimpleGrantedAuthority::new)
                                .toList();

                        userDetails = new UserDetailsImpl(
                                userId,
                                username,
                                email != null ? email : username,
                                null,
                                true,
                                authorities,
                                null,
                                null,
                                null
                        );
                    } else {
                        // Fallback for legacy tokens that only contained the username claim
                        userDetails = userDetailsService.loadUserByUsername(username);
                    }

                    UsernamePasswordAuthenticationToken authentication =
                            new UsernamePasswordAuthenticationToken(
                                    userDetails,
                                    null,
                                    userDetails.getAuthorities());

                    authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));

                    SecurityContextHolder.getContext().setAuthentication(authentication);
                } else {
                    SecurityContextHolder.clearContext();
                }
            } catch (Exception e) {
                logger.error("Cannot set user authentication: {}", e.getMessage(), e);
                SecurityContextHolder.clearContext();
            }
        }

        filterChain.doFilter(request, response);
    }

    // Checks Authorization header first, falls back to cookie.
    private String parseJwt(HttpServletRequest request) {
        String headerAuth = request.getHeader("Authorization");
        if (StringUtils.hasText(headerAuth) && headerAuth.startsWith("Bearer ")) {
            return headerAuth.substring(7);
        }

        return jwtUtils.getJwtFromCookies(request);
    }
}
