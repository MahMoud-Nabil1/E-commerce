package com.ecommerce.ecommerce.Security.Jwt;

import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.MediaType;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.stereotype.Component;
import tools.jackson.databind.json.JsonMapper;

import java.io.IOException;
import java.util.Map;

/**
 * Custom {@link AuthenticationEntryPoint} that is invoked whenever an
 * unauthenticated user attempts to access a protected resource.
 *
 * <p>Instead of redirecting to a login page (the default behaviour for
 * form-based auth), this entry point writes a structured JSON error response
 * with HTTP 401, making it suitable for a REST API consumed by SPA or
 * mobile clients.</p>
 *
 * <p>Registered in {@link com.ecommerce.ecommerce.Security.SecurityConfig}
 * as the global exception-handling entry point.</p>
 */
@Component
public class AuthEntryPointJwt implements AuthenticationEntryPoint {

    private static final Logger logger = LoggerFactory.getLogger(AuthEntryPointJwt.class);

    /** Thread-safe, reusable Jackson mapper — avoids creating a new instance per request. */
    private static final JsonMapper MAPPER = JsonMapper.builder().build();

    /**
     * Handles an authentication failure by writing a JSON error body to the response.
     *
     * @param request       the inbound HTTP request that triggered the exception
     * @param response      the HTTP response to populate
     * @param authException the exception that caused the authentication failure
     * @throws IOException      if writing to the output stream fails
     * @throws ServletException if a servlet-specific error occurs
     */
    @Override
    public void commence(HttpServletRequest request,
                         HttpServletResponse response,
                         AuthenticationException authException) throws IOException, ServletException {

        logger.error("Unauthorized access attempt on [{}]: {}", request.getServletPath(), authException.getMessage());

        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);

        // Build a structured error body consistent with Spring's ProblemDetail format
        final Map<String, Object> body = Map.of(
                "status", HttpServletResponse.SC_UNAUTHORIZED,
                "error", "Unauthorized",
                "message", authException.getMessage(),
                "path", request.getServletPath()
        );

        MAPPER.writeValue(response.getOutputStream(), body);
    }
}
