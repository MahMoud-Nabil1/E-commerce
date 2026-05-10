package com.ecommerce.ecommerce.config;

import io.github.cdimascio.dotenv.Dotenv;
import org.springframework.context.annotation.Configuration;

@Configuration
public class DotenvConfig {

    static {
        Dotenv dotenv = Dotenv.configure()
            .directory(".") // Looks for .env in project root
            .ignoreIfMissing()
            .load();

        // Load all .env variables into system properties
        dotenv.entries().forEach(entry ->
            System.setProperty(entry.getKey(), entry.getValue())
        );
    }
}