// JWT creation, parsing, validation, and cookie management.
package com.ecommerce.ecommerce.Security.Jwt;

import com.ecommerce.ecommerce.Security.Services.UserDetailsImpl;
import io.jsonwebtoken.*;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import jakarta.annotation.PostConstruct;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseCookie;
import org.springframework.stereotype.Component;
import org.springframework.web.util.WebUtils;

import java.security.Key;
import java.util.Date;

/**
 * Utility component responsible for all JWT lifecycle operations:
 * <strong>generation</strong>, <strong>parsing</strong>,
 * <strong>validation</strong>,
 * and <strong>cookie management</strong>.
 *
 * <p>
 * The signing key is derived from a Base64-encoded secret configured in
 * {@code application.properties} and is computed <em>once</em> at startup
 * for optimal performance.
 * </p>
 *
 * <p>
 * JWT tokens are delivered to the browser inside an {@code HttpOnly},
 * {@code Secure}, {@code SameSite=Strict} cookie, providing robust
 * protection against XSS and CSRF attacks.
 * </p>
 *
 * @see AuthTokenFilter
 */
@Component
public class JwtUtils {

    private static final Logger logger = LoggerFactory.getLogger(JwtUtils.class);

    @Value("${spring.app.jwtSecret}")
    private String jwtSecret;

    @Value("${spring.app.jwtExpirationMs}")
    private int jwtExpirationMs;

    @Value("${spring.app.jwtCookieName:ecommerce-cookie}")
    private String jwtCookie;

    /**
     * HMAC-SHA signing key — computed once at startup and reused for every JWT
     * operation.
     */
    private Key signingKey;

    // Computes HMAC key once at startup to avoid per-request cost.
    @PostConstruct
    private void initSigningKey() {
        this.signingKey = Keys.hmacShaKeyFor(Decoders.BASE64.decode(jwtSecret));
    }

    // Reads JWT value from the named HttpOnly cookie.
    public String getJwtFromCookies(HttpServletRequest request) {
        Cookie cookie = WebUtils.getCookie(request, jwtCookie);
        return cookie != null ? cookie.getValue() : null;
    }

    /**
     * Generates a new JWT token for the given authenticated user and wraps it
     * in a secure, HttpOnly response cookie.
     *
     * <p>
     * Cookie security attributes:
     * <ul>
     * <li>{@code HttpOnly} — prevents JavaScript access (XSS mitigation)</li>
     * <li>{@code Secure} — cookie is only sent over HTTPS</li>
     * <li>{@code SameSite=Strict} — cookie is never sent on cross-origin requests
     * (CSRF mitigation)</li>
     * <li>{@code Path=/api} — limits cookie scope to API endpoints</li>
     * </ul>
     *
     * @param userPrincipal the authenticated user's details
     * @return a {@link ResponseCookie} containing the signed JWT
     */
    public ResponseCookie generateJwtCookie(UserDetailsImpl userPrincipal) {
        String jwt = generateTokenFromUsername(userPrincipal.getUsername());
        return ResponseCookie.from(jwtCookie, jwt)
                .path("/api")
                .maxAge(24 * 60 * 60) // Cookie valid for 24 hours
                .httpOnly(true) // Not accessible via JavaScript (XSS protection)
                .secure(true) // Transmitted only over HTTPS
                .sameSite("Strict") // Never sent on cross-origin requests (CSRF protection)
                .build();
    }

    // Returns an empty cookie that tells browser to delete JWT.
    public ResponseCookie getCleanJwtCookie() {
        return ResponseCookie.from(jwtCookie, "")
                .path("/api")
                .maxAge(0) // Instructs the browser to delete the cookie
                .httpOnly(true)
                .secure(true)
                .sameSite("Strict")
                .build();
    }

    // Builds a signed JWT with username as subject claim.
    public String generateTokenFromUsername(String username) {
        Date now = new Date();
        return Jwts.builder()
                .setSubject(username)
                .setIssuedAt(now)
                .setExpiration(new Date(now.getTime() + jwtExpirationMs))
                .signWith(signingKey, SignatureAlgorithm.HS256)
                .compact();
    }

    // Extracts username from a valid JWT token.
    public String getUserNameFromJwtToken(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(signingKey)
                .build()
                .parseClaimsJws(token)
                .getBody()
                .getSubject();
    }

    // Checks signature, structure, and expiration. Returns false on failure.
    public boolean validateJwtToken(String authToken) {
        try {
            Jwts.parserBuilder().setSigningKey(signingKey).build().parseClaimsJws(authToken);
            return true;
        } catch (MalformedJwtException e) {
            logger.error("Invalid JWT token: {}", e.getMessage());
        } catch (ExpiredJwtException e) {
            logger.error("JWT token is expired: {}", e.getMessage());
        } catch (UnsupportedJwtException e) {
            logger.error("JWT token is unsupported: {}", e.getMessage());
        } catch (IllegalArgumentException e) {
            logger.error("JWT claims string is empty: {}", e.getMessage());
        }
        return false;
    }
}
