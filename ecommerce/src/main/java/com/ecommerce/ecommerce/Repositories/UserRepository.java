// DB access for users: existence checks and username lookup.
package com.ecommerce.ecommerce.Repositories;

import com.ecommerce.ecommerce.Models.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    // Used during registration to prevent duplicate usernames.
    boolean existsByUsername(String username);

    // Used during registration to prevent duplicate emails.
    boolean existsByEmail(String email);

    // Used by security layer to load user during authentication.
    Optional<User> findByUsername(String username);
}
