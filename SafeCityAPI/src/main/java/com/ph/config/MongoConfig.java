package com.ph.config;

//import com.mongodb.MongoClient;
//import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
//import org.springframework.data.mongodb.MongoDbFactory;
//import org.springframework.data.mongodb.core.MongoOperations;
//import org.springframework.data.mongodb.core.MongoTemplate;
//import org.springframework.data.mongodb.core.SimpleMongoDbFactory;

/**
 * Created by leon on 23/04/2017.
 */
@Configuration
public class MongoConfig {

//    @Bean
//    public MongoDbFactory mongoDbFactory() {
//        return new SimpleMongoDbFactory(new MongoClient(System.getProperty("mongo.host", "localhost"),
//                Integer.parseInt(System.getProperty("mongo.port", "27017"))), "safe_city");
//    }
//
//    @Bean
//    public MongoOperations mongoOperations(){
//        return new MongoTemplate(mongoDbFactory());
//    }
}
