package com.ecommerce.ecommerce.Security;

import com.ecommerce.ecommerce.Security.Jwt.AuthEntryPointJwt;
import com.ecommerce.ecommerce.Security.Jwt.AuthTokenFilter;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

/**
 * Central Spring Security configuration for the E-commerce application.
 *
 * <p>Establishes a <strong>stateless</strong> security model backed by JWT tokens
 * transported via HttpOnly cookies. Key decisions:
 * <ul>
 *   <li>CSRF is disabled because the API is stateless and cookie-based CSRF
 *       is mitigated by the {@code SameSite=Strict} attribute on the JWT cookie.</li>
 *   <li>Session creation is set to {@code STATELESS} — no {@code JSESSIONID}
 *       cookie will ever be issued.</li>
 *   <li>The {@link AuthTokenFilter} is registered <em>before</em>
 *       {@link UsernamePasswordAuthenticationFilter} so that JWT-based
 *       authentication is evaluated on every request.</li>
 * </ul>
 *
 * @see AuthTokenFilter
 * @see AuthEntryPointJwt
 */
@Configuration
@EnableWebSecurity
@EnableMethodSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final AuthEntryPointJwt unauthorizedHandler;
    private final AuthTokenFilter authTokenFilter;

    /**
     * Exposes a {@link BCryptPasswordEncoder} as the application-wide
     * {@link PasswordEncoder} bean.
     *
     * @return a BCrypt-based password encoder
     */
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    /**
     * Exposes the default {@link AuthenticationManager} so that it can be
     * injected into the service layer for programmatic authentication.
     *
     * @param authConfig the auto-configured {@link AuthenticationConfiguration}
     * @return the configured {@link AuthenticationManager}
     * @throws Exception if the manager cannot be built
     */
    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration authConfig) throws Exception {
        return authConfig.getAuthenticationManager();
    }

    /**
     * Builds the {@link SecurityFilterChain} defining HTTP security rules.
     *
     * @param http the {@link HttpSecurity} DSL builder
     * @return the assembled filter chain
     * @throws Exception if configuration fails
     */
    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                // CSRF is safe to disable: the API is fully stateless and the JWT cookie
                // uses SameSite=Strict, which prevents cross-origin form submissions.
                .csrf(AbstractHttpConfigurer::disable)
                .cors(AbstractHttpConfigurer::disable)

                // Return a structured JSON 401 response for unauthenticated requests
                .exceptionHandling(exception ->
                        exception.authenticationEntryPoint(unauthorizedHandler))

                // Public endpoints: authentication routes only
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers("/api/auth/**").permitAll()
                        .anyRequest().authenticated()
                )

                // Stateless session: Spring Security will never create or use an HTTP session
                .sessionManagement(session ->
                        session.sessionCreationPolicy(SessionCreationPolicy.STATELESS));

        // Register the JWT filter before Spring's default username/password filter
        http.addFilterBefore(authTokenFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}
