package com.ph.service

import IncidentsList
import StatsOnTimeList
import com.ph.config.PropertiesConfiguration
import com.ph.model.DangerCount
import com.ph.model.Incident
import com.ph.model.StatsOnTime
import com.ph.request.IncidentForm
import com.ph.rest.template.BasicAuthRestTemplate
import org.springframework.stereotype.Service

@Service
class ApiService(private val basicAuthRestTemplate: BasicAuthRestTemplate,
                 private val propertiesConfiguration: PropertiesConfiguration){

    fun saveIncident(incidentForm: IncidentForm) =
            basicAuthRestTemplate.postForObject("${propertiesConfiguration.host}/save-incident", incidentForm, Incident::class.java)


    fun getNearIncidents(lat: Double, lng: Double): List<Incident> =
            basicAuthRestTemplate.getForEntity("${propertiesConfiguration.host}/incident/near?lat=$lat&lng=$lng",
                    IncidentsList::class.java).body


    fun getApiKey(): String? =
            basicAuthRestTemplate.getForObject("${propertiesConfiguration.host}/map-key", String::class.java)


    fun getStatistics(lat: Double, lng: Double): List<StatsOnTime> =
            basicAuthRestTemplate.getForEntity("${propertiesConfiguration.host}/statistics?lat=$lat&lng=$lng",
                    StatsOnTimeList::class.java).body


    fun getDangerCount(lat: Double, lng: Double): DangerCount =
            basicAuthRestTemplate.getForObject("${propertiesConfiguration.host}/danger-count?lat=$lat&lng=$lng", DangerCount::class.java)

}
