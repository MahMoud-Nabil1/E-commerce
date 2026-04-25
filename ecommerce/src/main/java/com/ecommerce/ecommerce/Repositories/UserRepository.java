package com.ecommerce.ecommerce.Repositories;

import com.ecommerce.ecommerce.Models.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
@Repository
public interface UserRepository extends JpaRepository<User, Integer> {

    Boolean existsByUsername(String username);
    Boolean existsByEmail(String email);


    Optional<User> findByUserName(String username);
}
