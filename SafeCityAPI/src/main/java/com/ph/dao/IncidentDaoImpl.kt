package com.ph.dao

import com.ph.model.Incident
import org.springframework.data.geo.Point
import org.springframework.data.mongodb.core.MongoOperations
import org.springframework.data.mongodb.core.query.Criteria
import org.springframework.data.mongodb.core.query.Query
import org.springframework.stereotype.Service

@Service("incidentDao")
class IncidentDaoImpl(private val mongoOperations: MongoOperations): IncidentDao {

    override fun save(incident: Incident) {
        mongoOperations.save(incident)
    }

    override fun getNearIncidents(lat: Double, lng: Double): List<Incident> = mongoOperations.find(
                Query(
                        Criteria.where("location").nearSphere(Point(lng, lat)).maxDistance(0.0001)),
                Incident::class.java)


    override fun delete(incident: Incident) {
        mongoOperations.remove(incident)
    }
}