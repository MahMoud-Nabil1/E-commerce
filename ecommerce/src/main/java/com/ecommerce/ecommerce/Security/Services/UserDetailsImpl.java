package com.ecommerce.ecommerce.Security.Services;

import com.ecommerce.ecommerce.Models.User;
import com.fasterxml.jackson.annotation.JsonIgnore;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Custom implementation of Spring Security's UserDetails interface.
 * Used to wrap the User entity into an object that Spring Security can use for authentication and authorization.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserDetailsImpl implements UserDetails {

    private Long id;
    private String username;
    private String email;

    // Prevents the password from being serialized in JSON responses for security
    @JsonIgnore
    private String password;

    private Collection<? extends GrantedAuthority> authorities;

    /**
     * Static factory method to convert a User entity into a UserDetailsImpl object.
     * Maps roles from the entity to Spring Security GrantedAuthority.
     * * @param user the User entity from the database
     * @return a UserDetailsImpl instance
     */
    public static UserDetailsImpl build(User user) {
        // Map User roles to SimpleGrantedAuthority
        List<GrantedAuthority> authorities = user.getRoles().stream()
                .map(role -> new SimpleGrantedAuthority(role.getRoleName().name()))
                .collect(Collectors.toList());

        return new UserDetailsImpl(
                user.getUserId(),
                user.getUsername(),
                user.getEmail(),
                user.getPassword(),
                authorities);
    }

    /**
     * Returns the authorities granted to the user.
     */
    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return authorities;
    }

    /**
     * Indicates whether the user's account has expired.
     * @return true (defaults to active)
     */
    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    /**
     * Indicates whether the user is locked or unlocked.
     * @return true (defaults to not locked)
     */
    @Override
    public boolean isAccountNonLocked() {
        return true;
    }

    /**
     * Indicates whether the user's credentials (password) has expired.
     * @return true (defaults to not expired)
     */
    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    /**
     * Indicates whether the user is enabled or disabled.
     * @return true (defaults to enabled)
     */
    @Override
    public boolean isEnabled() {
        return true;
    }
}
