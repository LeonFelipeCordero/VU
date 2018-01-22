package com.ph.dao

import com.google.cloud.firestore.GeoPoint
import com.ph.model.Incident
import com.ph.service.FireStoreServiceImpl
import org.springframework.stereotype.Service

@Service("incidentDao")
class IncidentDaoImpl(/*private val mongoOperations: MongoOperations*/private val fireStoreService: FireStoreServiceImpl) : IncidentDao {


    override fun save(incident: Incident) {
        val id = fireStoreService.generateDocument()
        incident._id = id
        fireStoreService.db.collection("incident").document(id!!).set(incident.toMap() as Map<*, *>)
    }

    override fun getNearIncidents(lat: Double, lng: Double): List<Incident> {
        val incidents = fireStoreService.db.collection("incident")

        val query = if (lat > 0 && lng > 0) {
            incidents
                    .whereGreaterThan("location", GeoPoint(lat - .005, lng - .005))
                    .whereLessThan("location", GeoPoint(lat + .005, lng + .005)).get()
        } else if (lat > 0 && lng < 0) {
            incidents
                    .whereGreaterThan("location", GeoPoint(lat - .005, lng + .005))
                    .whereLessThan("location", GeoPoint(lat + .005, lng - .005)).get()
        } else if (lat < 0 && lng > 0) {
            incidents
                    .whereGreaterThan("location", GeoPoint(lat + .005, lng - .005))
                    .whereLessThan("location", GeoPoint(lat - .005, lng + .005)).get()
        } else {
            incidents
                    .whereGreaterThan("location", GeoPoint(lat + .005, lng + .005))
                    .whereLessThan("location", GeoPoint(lat - .005, lng - .005)).get()
        }
        val documents = query.get().documents
        return documents.map { it.toObject(Incident::class.java) }

//            mongoOperations.find(
//                Query(
//                        Criteria.where("location").nearSphere(Point(lng, lat)).maxDistance(0.0001)),
//                Incident::class.java)
    }
}