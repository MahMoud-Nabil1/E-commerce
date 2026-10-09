// Security rules, role-based access, and DB seeder for default admin.
package com.ecommerce.ecommerce.Security;

import com.ecommerce.ecommerce.Models.AppRole;
import com.ecommerce.ecommerce.Models.Role;
import com.ecommerce.ecommerce.Models.User;
import com.ecommerce.ecommerce.Repositories.RoleRepository;
import com.ecommerce.ecommerce.Repositories.UserRepository;
import com.ecommerce.ecommerce.Security.Jwt.AuthEntryPointJwt;
import com.ecommerce.ecommerce.Security.Jwt.AuthTokenFilter;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
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
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.security.web.context.NullSecurityContextRepository;
import org.springframework.web.cors.CorsConfigurationSource;

import java.util.Set;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
@RequiredArgsConstructor
@Slf4j
public class SecurityConfig {

    private final AuthEntryPointJwt unauthorizedHandler;
    private final CustomAccessDeniedHandler accessDeniedHandler;
    private final AuthTokenFilter authTokenFilter;
    private final CorsConfigurationSource corsConfigurationSource;

    // Exposes Spring's auth manager for use in AuthService.
    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration authConfig) throws Exception {
        return authConfig.getAuthenticationManager();
    }

    // Defines URL access rules and stateless JWT session policy.
    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                // CSRF disabled because JWT / Bearer headers handle protection statelessly.
                .csrf(AbstractHttpConfigurer::disable)
                .cors(cors -> cors.configurationSource(corsConfigurationSource))
                .exceptionHandling(exception -> exception
                        .authenticationEntryPoint(unauthorizedHandler)
                        .accessDeniedHandler(accessDeniedHandler))
                // Do not store the SecurityContext in the HTTP Session to keep REST APIs stateless
                .securityContext(context -> context.securityContextRepository(new NullSecurityContextRepository()))
                // Stateless session policy for REST APIs using JWT
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))

                .authorizeHttpRequests(auth -> auth
                        // Public Auth & Onboarding endpoints
                        .requestMatchers("/api/auth/**").permitAll()
                        // Public product catalog and category browsing
                        .requestMatchers("/api/public/**").permitAll()
                        // Platform Admin-only endpoints
                        .requestMatchers("/api/admin/**").hasRole("ADMIN")
                        // Diagnostic endpoint: only Admins may view all carts across the platform
                        .requestMatchers("/api/carts").hasRole("ADMIN")
                        // Sellers and Admins can access seller APIs to manage products and orders
                        .requestMatchers("/api/seller/**").hasAnyRole("SELLER", "ADMIN")
                        // General infrastructure endpoints
                        .requestMatchers("/error").permitAll()
                        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                        // All other endpoints require authentication
                        .anyRequest().authenticated());

        // JWT filter runs before Spring's default username/password filter.
        http.addFilterBefore(authTokenFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    // Seeds roles, default admin, and hardcoded super admin on first startup.
    @Bean
    public CommandLineRunner initData(RoleRepository roleRepository, UserRepository userRepository,
            PasswordEncoder passwordEncoder) {
        return args -> {
            Role userRole = roleRepository.findByRoleName(AppRole.ROLE_USER)
                    .orElseGet(() -> roleRepository.save(new Role(AppRole.ROLE_USER)));

            Role sellerRole = roleRepository.findByRoleName(AppRole.ROLE_SELLER)
                    .orElseGet(() -> roleRepository.save(new Role(AppRole.ROLE_SELLER)));

            Role adminRole = roleRepository.findByRoleName(AppRole.ROLE_ADMIN)
                    .orElseGet(() -> roleRepository.save(new Role(AppRole.ROLE_ADMIN)));

            // Admins manage the platform, not a store.
            Set<Role> adminRoles = Set.of(userRole, adminRole);

            if (!userRepository.existsByUsername("admin")) {
                User admin = new User("admin", "admin@shopflow.com", passwordEncoder.encode("Admin@123"));
                admin.setRoles(adminRoles);
                userRepository.save(admin);
                log.info("Default Admin created: {}", admin.getUsername());
            } else {
                userRepository.findByUsernameWithRoles("admin").ifPresent(admin -> {
                    if (admin.getRoles().contains(sellerRole)) {
                        admin.getRoles().remove(sellerRole);
                        userRepository.save(admin);
                        log.info("Fixed admin roles: removed ROLE_SELLER");
                    }
                });
            }

            if (!userRepository.existsByUsername("superadmin")) {
                User superAdmin = new User("superadmin", "superadmin@shopflow.com",
                        passwordEncoder.encode("SuperAdmin@999"));
                superAdmin.setRoles(adminRoles);
                userRepository.save(superAdmin);
                log.info("Super Admin created: {}", superAdmin.getUsername());
            } else {
                userRepository.findByUsernameWithRoles("superadmin").ifPresent(superAdmin -> {
                    if (superAdmin.getRoles().contains(sellerRole)) {
                        superAdmin.getRoles().remove(sellerRole);
                        userRepository.save(superAdmin);
                        log.info("Fixed superadmin roles: removed ROLE_SELLER");
                    }
                });
            }
        };
    }
}
