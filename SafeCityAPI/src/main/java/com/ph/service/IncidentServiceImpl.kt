package com.ph.service

import com.ph.dao.IncidentDao
import com.ph.dto.TimeIncidentCount
import com.ph.form.IncidentForm
import com.ph.model.Incident
import org.springframework.data.mongodb.core.geo.GeoJsonPoint
import org.springframework.stereotype.Service
import java.text.ParseException
import java.text.SimpleDateFormat
import java.util.*

@Service("incidentService")
class IncidentServiceImpl(private val incidentDao: IncidentDao) : IncidentService {

    override fun convertFormToIncident(incidentForm: IncidentForm): Incident
            = Incident(
            GeoJsonPoint(java.lang.Double.parseDouble(incidentForm.lng), java.lang.Double.parseDouble(incidentForm.lat)),
            incidentForm.title,
            incidentForm.description,
            incidentForm.incident,
            getIncidentLevel(incidentForm.incident),
            getDateFormat(incidentForm.date)
    )


    override fun findNearIncidents(lat: Double, lng: Double): kotlin.collections.List<Incident> = incidentDao.getNearIncidents(lat, lng)


    override fun save(incident: Incident) {
        incidentDao.save(incident)
    }

    override fun getStatisticsByZone(lat: Double, lng: Double): MutableList<TimeIncidentCount> {
        return incidentDao.getStatistics(lat, lng)
    }



    private fun getIncidentLevel(incident: String): Int =
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
            }

    private fun getDateFormat(date: String): Date {
        val format = SimpleDateFormat("yyyy-MM-dd'T'HH:mm")
        try {
            return format.parse(date)
        } catch (e: ParseException) {
            e.printStackTrace()
        }
        return Date()
    }
}