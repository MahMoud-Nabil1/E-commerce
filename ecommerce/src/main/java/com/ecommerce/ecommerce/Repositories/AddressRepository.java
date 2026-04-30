// DB access for addresses: inherits standard CRUD from JpaRepository.
package com.ecommerce.ecommerce.Repositories;

import com.ecommerce.ecommerce.Models.Address;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AddressRepository extends JpaRepository<Address, Long> {
}
