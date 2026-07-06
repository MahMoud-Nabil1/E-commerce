package com.ecommerce.ecommerce;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cache.annotation.EnableCaching;

@SpringBootApplication
@EnableCaching
public class EcommerceApplication {

	public static void main(String[] args) {
		// Load .env from current directory
		io.github.cdimascio.dotenv.Dotenv dotenv = io.github.cdimascio.dotenv.Dotenv.configure()
				.directory(".")
				.ignoreIfMissing()
				.load();
		dotenv.entries().forEach(entry -> System.setProperty(entry.getKey(), entry.getValue()));

		// Also check in ./ecommerce subdirectory (in case run from the workspace root)
		io.github.cdimascio.dotenv.Dotenv subDotenv = io.github.cdimascio.dotenv.Dotenv.configure()
				.directory("./ecommerce")
				.ignoreIfMissing()
				.load();
		subDotenv.entries().forEach(entry -> {
			if (System.getProperty(entry.getKey()) == null) {
				System.setProperty(entry.getKey(), entry.getValue());
			}
		});

		SpringApplication.run(EcommerceApplication.class, args);
	}

}
