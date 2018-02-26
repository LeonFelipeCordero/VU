package com.ph.config;

import com.mongodb.MongoClient;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.env.Environment;
import org.springframework.data.mongodb.MongoDbFactory;
import org.springframework.data.mongodb.core.MongoOperations;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.SimpleMongoDbFactory;

/**
 * Created by leon on 23/04/2017.
 */
@Configuration
public class MongoConfig {

    private Environment environment;

    @Autowired
    public MongoConfig(Environment environment) {
        this.environment = environment;
    }


    @Bean
    public MongoDbFactory mongoDbFactory() {
        return new SimpleMongoDbFactory(new MongoClient(environment.getProperty("mongo.hostname")), "safe_city");
    }

    @Bean
    public MongoOperations mongoOperations() {
        return new MongoTemplate(mongoDbFactory());
    }
}
