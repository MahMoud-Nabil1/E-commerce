package com.ecommerce.ecommerce.Security.Jwt;

import com.ecommerce.ecommerce.Security.Services.UserDetailsServiceImpl;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

/**
 * JWT authentication filter that executes <strong>once per request</strong>.
 *
 * <p>Intercepts every incoming HTTP request, extracts a JWT token from either
 * the {@code Authorization: Bearer …} header or the HttpOnly cookie, validates
 * it, and — if valid — populates the {@link SecurityContextHolder} with the
 * authenticated principal.</p>
 *
 * <p>This filter is registered <em>before</em>
 * {@link org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter}
 * in the Spring Security filter chain (see
 * {@link com.ecommerce.ecommerce.Security.SecurityConfig}).</p>
 */
@Component
@RequiredArgsConstructor
public class AuthTokenFilter extends OncePerRequestFilter {

    private final JwtUtils jwtUtils;
    private final UserDetailsServiceImpl userDetailsService;

    private static final Logger logger = LoggerFactory.getLogger(AuthTokenFilter.class);

    /**
     * Core filter logic: extract → validate → authenticate.
     *
     * @param request     the current HTTP request
     * @param response    the current HTTP response
     * @param filterChain the remaining filter chain
     * @throws ServletException if a servlet error occurs
     * @throws IOException      if an I/O error occurs
     */
    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {
        try {
            // Step 1: Extract JWT from Authorization header or HttpOnly cookie
            String jwt = parseJwt(request);

            // Step 2: Validate the token's signature, expiration, and structure
            if (jwt != null && jwtUtils.validateJwtToken(jwt)) {
                String username = jwtUtils.getUserNameFromJwtToken(jwt);

                // Step 3: Load full user details from the database
                UserDetails userDetails = userDetailsService.loadUserByUsername(username);

                // Step 4: Build an authentication token with the user's granted authorities.
                // Credentials are set to null because the JWT already proved identity.
                UsernamePasswordAuthenticationToken authentication =
                        new UsernamePasswordAuthenticationToken(
                                userDetails,
                                null,
                                userDetails.getAuthorities());

                // Attach request-level details (remote address, session ID, etc.)
                authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));

                // Step 5: Inject the authentication into the SecurityContext so that
                // downstream filters and controllers see the user as authenticated.
                SecurityContextHolder.getContext().setAuthentication(authentication);
            }
        } catch (Exception e) {
            // Log and swallow — the request will proceed unauthenticated,
            // and Spring Security's entry point will handle the 401 if needed.
            logger.error("Cannot set user authentication: {}", e.getMessage(), e);
        }

        // Continue the filter chain regardless of authentication outcome
        filterChain.doFilter(request, response);
    }

    /**
     * Extracts the JWT token from the request.
     *
     * <p>Resolution order:
     * <ol>
     *   <li>{@code Authorization: Bearer <token>} header (preferred for API clients)</li>
     *   <li>HttpOnly cookie fallback (preferred for browser-based SPAs)</li>
     * </ol>
     *
     * @param request the current HTTP request
     * @return the raw JWT string, or {@code null} if no token is present
     */
    private String parseJwt(HttpServletRequest request) {
        // Primary: Authorization header (standard for API consumers)
        String headerAuth = request.getHeader("Authorization");
        if (StringUtils.hasText(headerAuth) && headerAuth.startsWith("Bearer ")) {
            return headerAuth.substring(7);
        }

        // Fallback: HttpOnly cookie (secure browser-based transport)
        return jwtUtils.getJwtFromCookies(request);
    }
}