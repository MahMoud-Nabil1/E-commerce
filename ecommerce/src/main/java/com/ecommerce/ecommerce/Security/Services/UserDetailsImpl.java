// Wraps User entity into Spring Security's UserDetails principal format.
package com.ecommerce.ecommerce.Security.Services;

import com.ecommerce.ecommerce.Models.User;
import com.fasterxml.jackson.annotation.JsonIgnore;
import lombok.Getter;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import java.util.Collection;
import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;

@Getter
public class UserDetailsImpl implements UserDetails {

    private final Long id;
    private final String username;
    private final String email;
    private final String displayName;
    private final String phone;
    private final java.time.LocalDate joinedDate;

    // Excluded from JSON to prevent password hash leaking in API responses.
    @JsonIgnore
    private final String password;

    private final boolean enabled;

    private final Collection<? extends GrantedAuthority> authorities;

    public UserDetailsImpl(Long id, String username, String email, String password, boolean enabled,
                           Collection<? extends GrantedAuthority> authorities,
                           String displayName, String phone, java.time.LocalDate joinedDate) {
        this.id = id;
        this.username = username;
        this.email = email;
        this.password = password;
        this.enabled = enabled;
        this.authorities = authorities;
        this.displayName = displayName;
        this.phone = phone;
        this.joinedDate = joinedDate;
    }

    // Converts DB User entity into Spring Security principal.
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
                authorities,
                user.getName(),
                user.getPhone(),
                user.getJoinedDate());
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
