// DB entity: maps AppRole enum values to database rows.
package com.ecommerce.ecommerce.Models;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "Roles")
public class Role {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "role_id")
    private Integer roleId;

    // Stored as string ("ROLE_USER") for Spring Security compatibility.
    @Enumerated(EnumType.STRING)
    @Column(name = "role_name", length = 20)
    private AppRole roleName;

    public Role(AppRole appRole) {
        this.roleName = appRole;

    }
}
