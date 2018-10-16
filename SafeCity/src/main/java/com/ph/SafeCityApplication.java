package com.ph;

import com.ph.rest.template.BasicAuthRestTemplate;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.scheduling.annotation.EnableAsync;

@EnableAsync(proxyTargetClass=true)
@SpringBootApplication
public class SafeCityApplication {

    public static void main(String[] args) {
        SpringApplication.run(SafeCityApplication.class, args);
    }

    @Bean
    public BasicAuthRestTemplate basicAuthRestTemplate() {
        return new BasicAuthRestTemplate();
    }

}
