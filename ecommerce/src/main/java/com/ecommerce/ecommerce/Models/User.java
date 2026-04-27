package com.ecommerce.ecommerce.Models;

import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.HashSet;
import java.util.Set;

/**
 * JPA entity representing an application user.
 *
 * <p>Mapped to the {@code Users} table with unique constraints on both
 * {@code username} and {@code email} columns to prevent duplicate accounts.</p>
 *
 * <p>Passwords are stored as BCrypt hashes — the plaintext password is
 * never persisted. Roles are managed via a many-to-many join table
 * ({@code user_role}).</p>
 *
 * @see Role
 * @see AppRole
 */
@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "Users", uniqueConstraints = {
        @UniqueConstraint(columnNames = "username"),
        @UniqueConstraint(columnNames = "email")
})
public class User {

    /** Auto-generated primary key. */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "user_id")
    private Long userId;

    /** The user's unique login name (max 20 characters). */
    @NotBlank
    @Size(max = 20)
    @Column(name = "username")
    private String username;

    /** The user's unique email address (max 50 characters). */
    @NotBlank
    @Size(max = 50)
    @Email
    @Column(name = "email")
    private String email;

    /** The BCrypt-hashed password (max 120 characters to accommodate the hash). */
    @NotBlank
    @Size(max = 120)
    @Column(name = "password")
    private String password;

    /** The set of roles assigned to this user, loaded lazily via a join table. */
    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(name = "user_role",
            joinColumns = @JoinColumn(name = "user_id"),
            inverseJoinColumns = @JoinColumn(name = "role_id"))
    private Set<Role> roles = new HashSet<>();

    public User(String username, String email, String password) {
        this.username = username;
        this.email = email;
        this.password = password;
    }
}