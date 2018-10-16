package com.ph.controllers

import com.ph.request.IncidentRequest
import com.ph.model.Danger
import com.ph.model.Incident
import com.ph.model.TimeIncidentCount
import com.ph.service.IncidentService
import com.ph.service.convertToIncident
import org.springframework.http.HttpStatus
import org.springframework.http.MediaType
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*

@RestController
class IncidentController(private val incidentService: IncidentService) {


    @GetMapping(value = ["/incident/near"], produces = [(MediaType.APPLICATION_JSON_VALUE)])
    fun nearIncidents(@RequestParam(value = "lat") lat: Double,
                      @RequestParam(value = "lng") lng: Double): List<Incident> =
            incidentService.findNearIncidents(lat, lng)


    @PostMapping(value = ["/save-incident"])
    fun saveIncident(@RequestBody incidentRequest: IncidentRequest): ResponseEntity<String> {
        return try {
            incidentService.save(incidentRequest.convertToIncident())
            ResponseEntity("incident processed", HttpStatus.ACCEPTED)
        } catch (e: Exception) {
            ResponseEntity("incident not processed", HttpStatus.UNPROCESSABLE_ENTITY)
        }
    }

    @GetMapping(value = ["/statistics"], produces = [(MediaType.APPLICATION_JSON_VALUE)])
    fun getDashboardData(@RequestParam(value = "lat") lat: Double,
                         @RequestParam(value = "lng") lng: Double):
            List<TimeIncidentCount> = incidentService.getStatisticsByZone(lat, lng)

    @GetMapping(value = ["/danger-count"], produces = [(MediaType.APPLICATION_JSON_VALUE)])
    fun getDangerAvg(@RequestParam(value = "lat") lat: Double,
                     @RequestParam(value = "lng") lng: Double):
            Danger = incidentService.getDangerCount(lat, lng)
}
