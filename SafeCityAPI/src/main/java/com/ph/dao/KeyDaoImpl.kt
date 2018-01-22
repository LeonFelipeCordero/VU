package com.ph.dao

import com.ph.model.Key
import com.ph.service.FireStoreServiceImpl
import org.springframework.stereotype.Service
import com.google.cloud.firestore.DocumentSnapshot
import org.springframework.core.convert.TypeDescriptor.collection
import com.google.cloud.firestore.QuerySnapshot
import com.google.api.core.ApiFuture




@Service("keyDao")
class KeyDaoImpl(/*private val mongoOperations: MongoOperations*/ private val fireStoreService: FireStoreServiceImpl) : KeyDao {

    override fun getGoogleMapsApiKey(): Key {
        val future = fireStoreService.db.collection("keys").whereEqualTo("name", "google.api").get()
        val documents = future.get().documents
        return documents[0].toObject(Key::class.java)
//        val searchQuery = Query(Criteria.where("name").`is`("google.api"))
//        searchQuery.limit(1)
//        return mongoOperations.findOne(searchQuery, Key::class.java)
    }
}