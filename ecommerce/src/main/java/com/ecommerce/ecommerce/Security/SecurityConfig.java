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

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final AuthEntryPointJwt unauthorizedHandler;
    private final AuthTokenFilter authTokenFilter;

    // BCrypt for password hashing across the app.
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    // Exposes Spring's auth manager for use in AuthService.
    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration authConfig) throws Exception {
        return authConfig.getAuthenticationManager();
    }

    // Defines URL access rules and stateless JWT session policy.
    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                // CSRF disabled because JWT cookies handle protection.
                .csrf(AbstractHttpConfigurer::disable)
                .cors(cors -> {
                })
                .exceptionHandling(exception -> exception.authenticationEntryPoint(unauthorizedHandler))
                // No server-side sessions; JWT is the source of truth.
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers("/api/auth/**").permitAll()
                        .requestMatchers("/api/admin/**").hasRole("ADMIN")
                        // Sellers only — admins manage via /api/admin/**, not /api/seller/**
                        .requestMatchers("/api/seller/**").hasRole("SELLER")
                        .requestMatchers("/api/public/**").permitAll()
                        .requestMatchers("/error").permitAll()
                        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
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

            // Admins are NOT sellers — they manage the platform, not a store.
            Set<Role> adminRoles = Set.of(userRole, adminRole);

            if (!userRepository.existsByUsername("admin")) {
                User admin = new User("admin", "admin@shopflow.com", passwordEncoder.encode("Admin@123"));
                admin.setRoles(adminRoles);
                userRepository.save(admin);
                System.out.println(">> Default Admin created: admin / Admin@123");
            } else {
                // Fix existing admin account if it was incorrectly given ROLE_SELLER.
                // Use JOIN FETCH to avoid LazyInitializationException outside a session.
                userRepository.findByUsernameWithRoles("admin").ifPresent(admin -> {
                    if (admin.getRoles().contains(sellerRole)) {
                        admin.getRoles().remove(sellerRole);
                        userRepository.save(admin);
                        System.out.println(">> Fixed admin roles: removed ROLE_SELLER");
                    }
                });
            }

            // Hardcoded super admin — always present, credentials never change via API.
            if (!userRepository.existsByUsername("superadmin")) {
                User superAdmin = new User("superadmin", "superadmin@shopflow.com",
                        passwordEncoder.encode("SuperAdmin@999"));
                superAdmin.setRoles(adminRoles);
                userRepository.save(superAdmin);
                System.out.println(">> Super Admin created: superadmin / SuperAdmin@999");
            } else {
                // Fix existing superadmin account if it was incorrectly given ROLE_SELLER.
                // Use JOIN FETCH to avoid LazyInitializationException outside a session.
                userRepository.findByUsernameWithRoles("superadmin").ifPresent(superAdmin -> {
                    if (superAdmin.getRoles().contains(sellerRole)) {
                        superAdmin.getRoles().remove(sellerRole);
                        userRepository.save(superAdmin);
                        System.out.println(">> Fixed superadmin roles: removed ROLE_SELLER");
                    }
                });
            }
        };
    }
}
