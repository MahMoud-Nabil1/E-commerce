// DB entity: application user with roles and addresses.
// Supports both local (username/password) and OAuth2 (Google, GitHub) sign-in.
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

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "Users", uniqueConstraints = {
        @UniqueConstraint(columnNames = "username"),
        @UniqueConstraint(columnNames = "email")
})
public class User {
    public java.util.List<Address> getAddresses() { return addresses; }
    public void setAddresses(java.util.List<Address> addresses) { this.addresses = addresses; }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "user_id")
    private Long userId;

    @NotBlank
    @Size(max = 50)
    @Column(name = "username")
    private String username;

    @NotBlank
    @Size(max = 50)
    @Email
    @Column(name = "email")
    private String email;

    // Nullable for OAuth2 users who authenticate via a provider and have no local password.
    @Size(max = 120)
    @Column(name = "password")
    private String password;

    // "local" for username/password accounts; "google" or "github" for OAuth2 accounts.
    @Column(name = "provider", length = 20, nullable = false)
    private String provider = "local";

    // The unique ID returned by the OAuth2 provider (e.g. Google sub, GitHub id).
    // Null for local accounts.
    @Column(name = "provider_id")
    private String providerId;

    // Many-to-many via join table; loaded lazily for performance.
    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(name = "user_role",
            joinColumns = @JoinColumn(name = "user_id"),
            inverseJoinColumns = @JoinColumn(name = "role_id"))
    private Set<Role> roles = new HashSet<>();

    @OneToMany(mappedBy = "user", cascade = {CascadeType.PERSIST, CascadeType.MERGE}, orphanRemoval = true)
    private java.util.List<Address> addresses = new java.util.ArrayList<>();

    // Constructor for local (username/password) registration.
    public User(String username, String email, String password) {
        this.username = username;
        this.email = email;
        this.password = password;
        this.provider = "local";
    }

    // Constructor for OAuth2 user creation.
    public User(String username, String email, String provider, String providerId) {
        this.username = username;
        this.email = email;
        this.provider = provider;
        this.providerId = providerId;
    }
        
    @OneToOne(mappedBy = "user", cascade = { CascadeType.PERSIST, CascadeType.MERGE}, orphanRemoval = true)
    private Cart cart;
        
    @OneToMany(mappedBy = "user",
            cascade = {CascadeType.PERSIST, CascadeType.MERGE},
            orphanRemoval = true)
    private Set<Product> products;
}
