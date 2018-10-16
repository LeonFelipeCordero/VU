package com.ph.repository

import com.ph.model.Key
import org.springframework.data.mongodb.repository.MongoRepository
import org.springframework.stereotype.Repository

@Repository
interface KeyRepository : MongoRepository<Key, String> {
    fun findKeyByName(name: String): Key
}
