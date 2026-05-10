// DB access for users: existence checks and username lookup.
package com.ecommerce.ecommerce.Repositories;

import com.ecommerce.ecommerce.Models.AppRole;
import com.ecommerce.ecommerce.Models.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    // Used during registration to prevent duplicate usernames.
    boolean existsByUsername(String username);

    // Used during registration to prevent duplicate emails.
    boolean existsByEmail(String email);

    // Used by security layer to load user during authentication.
    Optional<User> findByUsername(String username);

    // Eagerly fetches roles alongside the user — safe to use outside a transaction.
    @Query("SELECT u FROM User u JOIN FETCH u.roles WHERE u.username = :username")
    Optional<User> findByUsernameWithRoles(@Param("username") String username);

    // Count of users with a specific role — used for pagination total.
    @Query("SELECT COUNT(DISTINCT u) FROM User u JOIN u.roles r WHERE r.roleName = :roleName")
    long countByRoleName(@Param("roleName") AppRole roleName);

    // Fetches users with a specific role, eagerly loading roles to avoid LazyInitializationException.
    @Query("SELECT DISTINCT u FROM User u JOIN FETCH u.roles r WHERE r.roleName = :roleName")
    List<User> findAllByRoleNameWithRoles(@Param("roleName") AppRole roleName, Pageable pageable);
}
