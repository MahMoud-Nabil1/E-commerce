package com.ecommerce.ecommerce.Repositories;

import com.ecommerce.ecommerce.Models.AppRole;
import com.ecommerce.ecommerce.Models.Role;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

/**
 * Spring Data JPA repository for {@link Role} entity persistence operations.
 *
 * <p>Used during registration to resolve {@link AppRole} enum values into
 * their corresponding database entities.</p>
 */
@Repository
public interface RoleRepository extends JpaRepository<Role, Integer> {

    /**
     * Finds a role entity by its {@link AppRole} enum name.
     *
     * @param appRole the role enum value to look up (e.g., {@code ROLE_USER})
     * @return an {@link Optional} containing the role, or empty if not found
     */
    Optional<Role> findByRoleName(AppRole appRole);
}
