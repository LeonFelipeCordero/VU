package com.ph.dao

import com.ph.model.Key
import org.springframework.data.mongodb.core.MongoOperations
import org.springframework.data.mongodb.core.query.Criteria
import org.springframework.data.mongodb.core.query.Query
import org.springframework.stereotype.Service

@Service("keyDao")
class KeyDaoImpl(private val mongoOperations: MongoOperations): KeyDao {

    override fun getGoogleMapsApiKey(): Key {
        val searchQuery = Query(Criteria.where("name").`is`("google.api"))
        searchQuery.limit(1)
        return mongoOperations.findOne(searchQuery, Key::class.java)
    }
}