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
import org.springframework.security.core.GrantedAuthority;
import org.springframework.stereotype.Component;
import org.springframework.web.util.WebUtils;

import java.nio.charset.StandardCharsets;
import java.security.Key;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.Date;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Utility component responsible for all JWT lifecycle operations:
 * <strong>generation</strong>, <strong>parsing</strong>,
 * <strong>validation</strong>, and <strong>cookie management</strong>.
 *
 * <p>
 * Adapted with rich claims propagation for microservices architecture:
 * tokens embed user identity (ID, email, roles, username) to enable
 * stateless authentication across service boundaries without per-request DB queries.
 * </p>
 */
@Component
public class JwtUtils {

    private static final Logger logger = LoggerFactory.getLogger(JwtUtils.class);

    @Value("${spring.app.jwtSecret}")
    private String jwtSecret;

    @Value("${spring.app.jwtExpirationMs:86400000}")
    private int jwtExpirationMs;

    @Value("${spring.app.jwtCookieName:ecommerce-cookie}")
    private String jwtCookie;

    // true in production (HTTPS), false for local HTTP dev
    @Value("${spring.app.cookieSecure:false}")
    private boolean cookieSecure;

    // "Lax" for same-site dev, "None" for cross-origin production (requires Secure=true)
    @Value("${spring.app.cookieSameSite:Lax}")
    private String cookieSameSite;

    private Key signingKey;

    /**
     * Initializes the HMAC-SHA signing key.
     * Supports standard Base64-encoded secrets as well as raw strings (derived via SHA-256).
     * Prevents startup crashes caused by invalid Base64 characters or short keys.
     */
    @PostConstruct
    public void initSigningKey() {
        if (jwtSecret == null || jwtSecret.isBlank()) {
            throw new IllegalStateException("JWT secret key must be configured in application.properties or environment");
        }
        try {
            byte[] decoded = Decoders.BASE64.decode(jwtSecret.trim());
            if (decoded.length >= 32) {
                this.signingKey = Keys.hmacShaKeyFor(decoded);
                return;
            }
        } catch (Exception ignored) {
            // Secret is not Base64-encoded or is malformed
        }

        // Fallback: derive 256-bit key from raw passphrase using SHA-256
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(jwtSecret.trim().getBytes(StandardCharsets.UTF_8));
            this.signingKey = Keys.hmacShaKeyFor(hash);
        } catch (NoSuchAlgorithmException e) {
            throw new RuntimeException("SHA-256 algorithm not available", e);
        }
    }

    // Reads JWT value from the named HttpOnly cookie.
    public String getJwtFromCookies(HttpServletRequest request) {
        Cookie cookie = WebUtils.getCookie(request, jwtCookie);
        return cookie != null ? cookie.getValue() : null;
    }

    /**
     * Generates a new JWT token with user claims and wraps it in a secure HttpOnly cookie.
     */
    public ResponseCookie generateJwtCookie(UserDetailsImpl userPrincipal) {
        String jwt = generateToken(userPrincipal);
        return ResponseCookie.from(jwtCookie, jwt)
                .path("/api")
                .maxAge(24 * 60 * 60)
                .httpOnly(true)
                .secure(cookieSecure)
                .sameSite(cookieSameSite)
                .build();
    }

    // Returns an empty cookie that instructs the browser to delete the JWT.
    public ResponseCookie getCleanJwtCookie() {
        return ResponseCookie.from(jwtCookie, "")
                .path("/api")
                .maxAge(0)
                .httpOnly(true)
                .secure(cookieSecure)
                .sameSite(cookieSameSite)
                .build();
    }

    /**
     * Generates a stateless JWT containing full principal identity:
     * subject (username), userId, email, and roles.
     */
    public String generateToken(UserDetailsImpl userPrincipal) {
        List<String> roles = userPrincipal.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .collect(Collectors.toList());

        Date now = new Date();
        return Jwts.builder()
                .setSubject(userPrincipal.getUsername())
                .claim("id", userPrincipal.getId())
                .claim("email", userPrincipal.getEmail())
                .claim("roles", roles)
                .setIssuedAt(now)
                .setExpiration(new Date(now.getTime() + jwtExpirationMs))
                .signWith(signingKey, SignatureAlgorithm.HS256)
                .compact();
    }

    /**
     * Backward-compatible token generator from username only.
     */
    public String generateTokenFromUsername(String username) {
        Date now = new Date();
        return Jwts.builder()
                .setSubject(username)
                .setIssuedAt(now)
                .setExpiration(new Date(now.getTime() + jwtExpirationMs))
                .signWith(signingKey, SignatureAlgorithm.HS256)
                .compact();
    }

    /**
     * Extracts all claims from a signed JWT.
     */
    public Claims extractAllClaims(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(signingKey)
                .build()
                .parseClaimsJws(token)
                .getBody();
    }

    // Extracts username (subject) from a valid JWT token.
    public String getUserNameFromJwtToken(String token) {
        return extractAllClaims(token).getSubject();
    }

    // Extracts user ID from token claims if present.
    public Long getUserIdFromJwtToken(String token) {
        try {
            Number id = extractAllClaims(token).get("id", Number.class);
            return id != null ? id.longValue() : null;
        } catch (Exception e) {
            return null;
        }
    }

    // Extracts email from token claims if present.
    public String getEmailFromJwtToken(String token) {
        try {
            return extractAllClaims(token).get("email", String.class);
        } catch (Exception e) {
            return null;
        }
    }

    // Extracts roles list from token claims if present.
    @SuppressWarnings("unchecked")
    public List<String> getRolesFromJwtToken(String token) {
        try {
            return extractAllClaims(token).get("roles", List.class);
        } catch (Exception e) {
            return null;
        }
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
        } catch (Exception e) {
            logger.error("JWT validation failed: {}", e.getMessage());
        }
        return false;
    }
}
