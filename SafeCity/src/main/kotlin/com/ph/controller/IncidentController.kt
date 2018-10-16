package com.ph.controller

import com.ph.model.Incident
import com.ph.request.IncidentForm
import com.ph.service.ApiService
import org.springframework.http.MediaType
import org.springframework.stereotype.Controller
import org.springframework.web.bind.annotation.*
import org.springframework.web.servlet.ModelAndView
import javax.validation.Valid

@RestController
class IncidentController(private val apiService: ApiService) {

    @GetMapping(value = ["/incident/near"], produces = [MediaType.APPLICATION_JSON_VALUE])
    fun nearIncidents(@RequestParam(value = "lat") lat: Double,
                      @RequestParam(value = "lng") lng: Double): List<Incident> =
            apiService.getNearIncidents(lat, lng).toList()

    @GetMapping(value = ["/incident-form"])
    fun getMarkerForm(@RequestParam("lat") lat: String,
                      @RequestParam("lng") lng: String,
                      modelAndView: ModelAndView): ModelAndView {
        modelAndView.addObject("incidentForm", IncidentForm(lat, lng))
        modelAndView.viewName = "forms/incident-form"
        return modelAndView
    }

    @PostMapping(value = ["/save-incident"])
    fun saveIncident(@Valid @ModelAttribute("incidentForm") incidentForm: IncidentForm,
                     modelAndView: ModelAndView): ModelAndView =
            try {
                apiService.saveIncident(incidentForm)
                modelAndView.viewName = "redirect:/?success=true"
                modelAndView
            } catch (e: Exception) {
                modelAndView.viewName = "redirect:/?success=false"
                modelAndView
            }

}
