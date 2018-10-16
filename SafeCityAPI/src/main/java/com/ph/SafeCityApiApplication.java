package com.ph;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;

@SpringBootApplication
@EnableAsync
public class SafeCityApiApplication {

	public static void main(String[] args) {
		SpringApplication.run(SafeCityApiApplication.class, args);
	}
}
