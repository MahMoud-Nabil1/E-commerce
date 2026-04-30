// DB access for roles: resolves AppRole enum to DB entity.
package com.ecommerce.ecommerce.Repositories;

import com.ecommerce.ecommerce.Models.AppRole;
import com.ecommerce.ecommerce.Models.Role;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface RoleRepository extends JpaRepository<Role, Integer> {

    // Used during registration and DB seeding to find/create roles.
    Optional<Role> findByRoleName(AppRole appRole);
}
