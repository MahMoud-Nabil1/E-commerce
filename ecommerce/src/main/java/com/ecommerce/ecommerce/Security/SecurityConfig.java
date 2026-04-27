package com.ecommerce.ecommerce.Security;

import com.ecommerce.ecommerce.Models.AppRole;
import com.ecommerce.ecommerce.Models.Role;
import com.ecommerce.ecommerce.Models.User;
import com.ecommerce.ecommerce.Repositories.RoleRepository;
import com.ecommerce.ecommerce.Repositories.UserRepository;
import com.ecommerce.ecommerce.Security.Jwt.AuthEntryPointJwt;
import com.ecommerce.ecommerce.Security.Jwt.AuthTokenFilter;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
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

import java.util.Set;

/**
 * Central Spring Security configuration for the ShopFlow E-commerce application.
 *
 * <p>Key Security Decisions:
 * <ul>
 * <li>Stateless Session Management: No HTTP sessions are used; JWT is the source of truth[cite: 87].</li>
 * <li>HttpOnly Cookies: JWT is transported via secure cookies to prevent XSS attacks.</li>
 * <li>RBAC (Role-Based Access Control): Access is restricted based on USER and ADMIN roles[cite: 315].</li>
 * </ul>
 */
@Configuration
@EnableWebSecurity
@EnableMethodSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final AuthEntryPointJwt unauthorizedHandler;
    private final AuthTokenFilter authTokenFilter;

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration authConfig) throws Exception {
        return authConfig.getAuthenticationManager();
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .csrf(AbstractHttpConfigurer::disable)
                .cors(cors -> {}) // Enable CORS with default settings or custom if needed
                .exceptionHandling(exception ->
                        exception.authenticationEntryPoint(unauthorizedHandler))
                .sessionManagement(session ->
                        session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth
                        // Public Endpoints
                        .requestMatchers("/api/auth/**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/products/**").permitAll() // Browsing is public [cite: 113, 189]

                        // Admin-Only Endpoints (Product Management)
                        .requestMatchers(HttpMethod.POST, "/api/products/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.PUT, "/api/products/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.DELETE, "/api/products/**").hasRole("ADMIN")

                        // Protected Endpoints
                        .requestMatchers("/api/cart/**").hasAnyRole("USER", "ADMIN")
                        .requestMatchers("/api/orders/**").hasAnyRole("USER", "ADMIN")

                        .anyRequest().authenticated()
                );

        http.addFilterBefore(authTokenFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    /**
     * Database Seeder: Automatically initializes roles and sample users on application startup.
     */
    @Bean
    public CommandLineRunner initData(RoleRepository roleRepository, UserRepository userRepository, PasswordEncoder passwordEncoder) {
        return args -> {
            // 1. Initialize Roles if they don't exist
            Role userRole = roleRepository.findByRoleName(AppRole.ROLE_USER)
                    .orElseGet(() -> roleRepository.save(new Role(AppRole.ROLE_USER)));

            Role sellerRole = roleRepository.findByRoleName(AppRole.ROLE_SELLER)
                    .orElseGet(() -> roleRepository.save(new Role(AppRole.ROLE_SELLER)));

            Role adminRole = roleRepository.findByRoleName(AppRole.ROLE_ADMIN)
                    .orElseGet(() -> roleRepository.save(new Role(AppRole.ROLE_ADMIN)));

            // 2. Pre-defined User Roles Sets
            Set<Role> adminRoles = Set.of(userRole, sellerRole, adminRole);

            // 3. Initialize Admin User (Check by username with lowercase 'n')
            if (!userRepository.existsByUsername("admin")) {
                User admin = new User("admin", "admin@shopflow.com", passwordEncoder.encode("Admin@123"));
                admin.setRoles(adminRoles);
                userRepository.save(admin);
                System.out.println(">> Default Admin created: admin / Admin@123");
            }
        };
    }
}
