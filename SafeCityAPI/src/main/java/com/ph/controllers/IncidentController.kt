package com.ph.controllers

import com.ph.dto.TimeIncidentCount
import com.ph.form.IncidentForm
import com.ph.model.Incident
import com.ph.service.IncidentService
import org.springframework.http.HttpHeaders
import org.springframework.http.HttpStatus
import org.springframework.http.MediaType
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*


@RestController
class IncidentController(private val incidentService: IncidentService) {


    @GetMapping(value = ["/incident/near"], produces = [(MediaType.APPLICATION_JSON_VALUE)])
    fun nearIncidents(@RequestParam(value = "lat") lat: Double,
                      @RequestParam(value = "lng") lng: Double):
            List<Incident> = incidentService.findNearIncidents(lat, lng)


    @PostMapping(value = ["/save-incident"])
    fun saveIncident(@RequestBody incidentForm: IncidentForm): ResponseEntity<String> {
        return try {
            incidentService.save(incidentService.convertFormToIncident(incidentForm))
            val responseHeaders = HttpHeaders()
            ResponseEntity("incident processed", responseHeaders, HttpStatus.ACCEPTED)
        } catch (e: Exception) {
            val responseHeaders = HttpHeaders()
            ResponseEntity("incident not processed", responseHeaders, HttpStatus.UNPROCESSABLE_ENTITY)
        }
    }

    @GetMapping(value = ["/statistics"], produces = [(MediaType.APPLICATION_JSON_VALUE)])
    fun getDashboardData(@RequestParam(value = "lat") lat: Double,
                         @RequestParam(value = "lng") lng: Double):
            MutableList<TimeIncidentCount> = incidentService.getStatisticsByZone(lat, lng)
}
