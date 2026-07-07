// Wraps User entity into Spring Security's principal format.
// Implements both UserDetails (for JWT/form login) and OAuth2User (for OAuth2 login)
// so a single principal type works across all authentication paths.
package com.ecommerce.ecommerce.Security.Services;

import com.ecommerce.ecommerce.Models.User;
import com.fasterxml.jackson.annotation.JsonIgnore;
import lombok.Getter;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.oauth2.core.user.OAuth2User;

import java.util.Collection;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.stream.Collectors;

@Getter
public class UserDetailsImpl implements UserDetails, OAuth2User {

    private final Long id;
    private final String username;
    private final String email;

    // Excluded from JSON to prevent password hash leaking in API responses.
    @JsonIgnore
    private final String password;

    private final boolean enabled;

    private final Collection<? extends GrantedAuthority> authorities;

    // Raw OAuth2 attributes — null for local (username/password) logins.
    // Stored so Spring Security's OAuth2 infrastructure can access them if needed.
    @JsonIgnore
    private Map<String, Object> oauth2Attributes;

    // Constructor for local (username/password) logins — no OAuth2 attributes.
    public UserDetailsImpl(Long id, String username, String email, String password, boolean enabled,
                           Collection<? extends GrantedAuthority> authorities) {
        this.id = id;
        this.username = username;
        this.email = email;
        this.password = password;
        this.enabled = enabled;
        this.authorities = authorities;
        this.oauth2Attributes = Map.of();
    }

    // Converts DB User entity into Spring Security principal.
    // Password may be null for OAuth2-only accounts — Spring Security handles this gracefully
    // because OAuth2 users never go through the UsernamePasswordAuthenticationFilter.
    public static UserDetailsImpl build(User user) {
        List<GrantedAuthority> authorities = user.getRoles().stream()
                .map(role -> new SimpleGrantedAuthority(role.getRoleName().name()))
                .collect(Collectors.toList());

        return new UserDetailsImpl(
                user.getUserId(),
                user.getUsername(),
                user.getEmail(),
                user.getPassword(),
                user.isEnabled(),
                authorities);
    }

    // ── OAuth2User ────────────────────────────────────────────────────────────

    // OAuth2User requires getName() — we return the username for consistency.
    @Override
    public String getName() {
        return username;
    }

    // Returns the raw OAuth2 attribute map (empty map for local logins).
    @Override
    public Map<String, Object> getAttributes() {
        return oauth2Attributes;
    }

    // ── UserDetails ───────────────────────────────────────────────────────────

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return authorities;
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return true;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return enabled;
    }

    // Equality based on user ID only.
    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        UserDetailsImpl that = (UserDetailsImpl) o;
        return Objects.equals(id, that.id);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id);
    }
}
