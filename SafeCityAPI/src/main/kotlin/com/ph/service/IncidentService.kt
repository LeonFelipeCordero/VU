package com.ph.service

import com.ph.dao.IncidentDao
import com.ph.request.IncidentRequest
import com.ph.model.Danger
import com.ph.model.Incident
import com.ph.model.IncidentCount
import com.ph.model.TimeIncidentCount
import com.ph.repository.IncidentRepository
import org.springframework.data.mongodb.core.geo.GeoJsonPoint
import org.springframework.stereotype.Service
import java.text.ParseException
import java.text.SimpleDateFormat
import java.util.*

@Service
open class IncidentService(private val incidentDao: IncidentDao,
                           private val incidentRepository: IncidentRepository) {

    fun save(incident: Incident): Incident = incidentRepository.save(incident)

    fun findNearIncidents(lat: Double, lng: Double): List<Incident> = incidentRepository.getNearIncidents(lat, lng)

    fun getStatisticsByZone(lat: Double, lng: Double): List<TimeIncidentCount> = incidentDao.getStatistics(lat, lng)

    fun getDangerCount(lat: Double, lng: Double): Danger = incidentDao.getDangerCount(lat, lng)
}

fun IncidentRequest.convertToIncident(): Incident =
        Incident(GeoJsonPoint(java.lang.Double.parseDouble(lng), java.lang.Double.parseDouble(lat)),
                title,
                description,
                incident,
                when (incident) {
                    "Fight" -> 1
                    "Big Fight" -> 2
                    "Theft" -> 3
                    "Establishment Theft" -> 4
                    "House Theft" -> 5
                    "Shooting" -> 6
                    "Murder" -> 7
                    "Drugs" -> 8
                    "Police Arrest" -> 5
                    "kidnapping" -> 5
                    "Rape" -> 8
                    else -> 3
                },
                getDateFormat(date)
        )

fun getDateFormat(date: String): Date {
    val format = SimpleDateFormat("yyyy-MM-dd'T'HH:mm")
    try {
        return format.parse(date)
    } catch (e: ParseException) {
        e.printStackTrace()
    }
    return Date()
}
