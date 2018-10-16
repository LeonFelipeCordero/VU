package com.ph.repository

import com.ph.model.Incident
import org.springframework.data.mongodb.repository.MongoRepository
import org.springframework.data.mongodb.repository.Query
import org.springframework.stereotype.Repository

@Repository
interface IncidentRepository : MongoRepository<Incident, String> {

    @Query("{location:{\$nearSphere:{\$geometry:{type:'Point',coordinates:[?0,?1]},\$minDistance:1,\$maxDistance:1000}}}")
    fun getNearIncidents(lat:Double, lng:Double): List<Incident>

//    @Query("")
//    fun getStatisticsByTime(lat: Double, lng: Double) : List<TimeIncidentCount>
}
