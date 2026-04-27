package com.ecommerce.ecommerce.Models;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * JPA entity representing an application security role.
 *
 * <p>Mapped to the {@code Roles} table. Each role corresponds to an
 * {@link AppRole} enum value and is stored as a string in the database
 * via {@link EnumType#STRING}.</p>
 *
 * @see AppRole
 * @see User
 */
@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "Roles")
public class Role {

    /** Auto-generated primary key. */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "role_id")
    private Integer roleId;

    /** The role name stored as a string enum (e.g., {@code ROLE_USER}). */
    @Enumerated(EnumType.STRING)
    @Column(name = "role_name", length = 20)
    private AppRole roleName;

    public Role(AppRole appRole) {
        this.roleName = appRole;

    }
}
