// Registers shared beans like ModelMapper for dependency injection.
package com.ecommerce.ecommerce.config;

import org.modelmapper.ModelMapper;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class AppConfiguration {
    // Used across services to convert between entities and DTOs.
    @Bean
    public ModelMapper modelMapper(){
        return new ModelMapper();
    }
}
