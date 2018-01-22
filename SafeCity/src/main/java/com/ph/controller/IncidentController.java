package com.ph.controller;

import com.ph.form.IncidentForm;
import com.ph.model.Incident;
import com.ph.rest.template.BasicAuthRestTemplate;
import com.ph.service.ApiService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.scheduling.annotation.Async;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.ModelAndView;

import javax.validation.Valid;
import java.util.Arrays;
import java.util.List;

/**
 * Created by leon on 25/07/17.
 */
@RestController
public class IncidentController {

    @Autowired
    private ApiService apiService;

    @GetMapping(value = "/incident/near", produces = MediaType.APPLICATION_JSON_VALUE)
    public List<Incident> nearIncidents(@RequestParam(value = "lat") double lat,
                                        @RequestParam(value = "lng") double lng) {
        ResponseEntity<Incident[]> incidents = apiService.getNearIncidents(lat, lng);
        return Arrays.asList(incidents.getBody());
    }

    @GetMapping(value = "/incident-form")
    public ModelAndView getMarkerForm(@RequestParam("lat") String lat,
                                      @RequestParam("lng") String lng,
                                      ModelAndView modelAndView) {
        modelAndView.addObject("incidentForm", new IncidentForm(lat, lng));
        modelAndView.setViewName("forms/incident-form");
        return modelAndView;
    }

    @PostMapping(value = "/save-incident")
    public ModelAndView saveIncident(@Valid @ModelAttribute("incidentForm") IncidentForm incidentForm,
                                     ModelAndView modelAndView) {
        try {
            apiService.saveIncident(incidentForm);
            modelAndView.setViewName("redirect:/?success=true");
        } catch (Exception e) {
            modelAndView.setViewName("redirect:/?success=false");
        }
        return modelAndView;
    }
}
