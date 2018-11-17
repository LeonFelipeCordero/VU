//package com.ph.config
//
//import com.mongodb.MongoClient
//import com.mongodb.async.client.MongoClients
//import org.springframework.context.annotation.Bean
//import org.springframework.data.mongodb.config.AbstractReactiveMongoConfiguration
//import org.springframework.data.mongodb.repository.config.EnableReactiveMongoRepositories
//
//@EnableReactiveMongoRepositories
//class MongoReactiveApplication : AbstractReactiveMongoConfiguration() {
//
//    @Bean
//    fun mongoClient(): MongoClient {
//        return MongoClients.create()
//    }
//
//    override fun getDatabaseName(): String {
//        return "safe_city"
//    }
//
//}
