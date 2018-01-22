package com.ph.controllers

import com.ph.form.IncidentForm
import com.ph.model.Incident
import com.ph.service.IncidentService
import org.springframework.http.MediaType
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*

@RestController
class IncidentController(private val incidentService: IncidentService) {


    @GetMapping(value = ["/incident/near"], produces = [(MediaType.APPLICATION_JSON_VALUE)])
    fun nearIncidents(@RequestParam(value = "lat") lat: Double,
                      @RequestParam(value = "lng") lng: Double):
            List<Incident> = incidentService.findNearIncidents(lat, lng)


    @PutMapping(value = ["/save-incident"])
    fun saveIncident(@RequestBody incidentForm: IncidentForm): ResponseEntity.BodyBuilder? {
        return try {
            incidentService.save(incidentService.convertFormToIncident(incidentForm))
            ResponseEntity.accepted()
        } catch (e: Exception) {
                ResponseEntity.unprocessableEntity()
        }
    }
}