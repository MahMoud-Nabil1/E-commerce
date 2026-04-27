package com.ecommerce.ecommerce.Security.Services;

import com.ecommerce.ecommerce.Models.User;
import com.fasterxml.jackson.annotation.JsonIgnore;
import lombok.AllArgsConstructor;
import lombok.Getter;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;

/**
 * Immutable implementation of Spring Security's {@link UserDetails} interface.
 *
 * <p>Wraps the domain {@link User} entity into a security-aware principal that
 * Spring Security uses throughout the authentication and authorization pipeline.
 * Once constructed via the {@link #build(User)} factory method, the object is
 * effectively immutable — no setters are exposed.</p>
 *
 * <p><strong>Security note:</strong> The {@code password} field is annotated with
 * {@link JsonIgnore} to prevent accidental serialization into API responses.</p>
 */
@Getter
@AllArgsConstructor
public class UserDetailsImpl implements UserDetails {

    private final Long id;
    private final String username;
    private final String email;

    /** The hashed password — excluded from JSON serialization for security. */
    @JsonIgnore
    private final String password;

    private final Collection<? extends GrantedAuthority> authorities;

    /**
     * Static factory method that converts a domain {@link User} entity into a
     * Spring Security–compatible {@link UserDetailsImpl}.
     *
     * <p>Each {@link com.ecommerce.ecommerce.Models.Role} is mapped to a
     * {@link SimpleGrantedAuthority} using the enum name (e.g., {@code ROLE_USER}).</p>
     *
     * @param user the persistent {@link User} entity loaded from the database
     * @return a fully populated {@link UserDetailsImpl} instance
     */
    public static UserDetailsImpl build(User user) {
        // Map domain roles → Spring Security GrantedAuthority objects
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

    /** {@inheritDoc} */
    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return authorities;
    }

    /**
     * Indicates whether the user's account has expired.
     *
     * @return {@code true} — accounts never expire in the current implementation
     */
    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    /**
     * Indicates whether the user is locked or unlocked.
     *
     * @return {@code true} — accounts are never locked in the current implementation
     */
    @Override
    public boolean isAccountNonLocked() {
        return true;
    }

    /**
     * Indicates whether the user's credentials (password) have expired.
     *
     * @return {@code true} — credentials never expire in the current implementation
     */
    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    /**
     * Indicates whether the user is enabled or disabled.
     *
     * @return {@code true} — all users are enabled in the current implementation
     */
    @Override
    public boolean isEnabled() {
        return true;
    }

    /**
     * Two {@link UserDetailsImpl} instances are equal if they share the same {@code id}.
     *
     * @param o the object to compare
     * @return {@code true} if both objects represent the same user
     */
    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        UserDetailsImpl that = (UserDetailsImpl) o;
        return Objects.equals(id, that.id);
    }

    /**
     * Hash code based on the user's {@code id}.
     *
     * @return the hash code
     */
    @Override
    public int hashCode() {
        return Objects.hash(id);
    }
}
