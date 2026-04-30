// DB access for payments: inherits standard CRUD from JpaRepository.
package com.ecommerce.ecommerce.Repositories;


import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.ecommerce.ecommerce.Models.Payment;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, Long>{

}
