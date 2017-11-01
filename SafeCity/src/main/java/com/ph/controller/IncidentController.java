package com.ph.controller;

import com.ph.form.IncidentForm;
import com.ph.model.Incident;
import com.ph.rest.template.BasicAuthRestTemplate;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
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

    @GetMapping(value = "/incident/near", produces = MediaType.APPLICATION_JSON_VALUE)
    public List<Incident> nearIncidents(@RequestParam(value = "lat") double lat,
                                        @RequestParam(value = "lng") double lng) {
        BasicAuthRestTemplate restTemplate = new BasicAuthRestTemplate("SafeCity", "SafeCity");
        ResponseEntity<Incident[]> incidents =
//                restTemplate.getForEntity("http://localhost:8081/incident/near?lat=28.646193125941&lng=-106.09076499939", Incident[].class);
                restTemplate.getForEntity("http://localhost:8081/incident/near?lat="+ lat +"&lng=" + lng, Incident[].class);
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
            BasicAuthRestTemplate restTemplate = new BasicAuthRestTemplate("SafeCity", "SafeCity");
            restTemplate.put("http://localhost:8081/save-incident", incidentForm);
            modelAndView.setViewName("redirect:/?success=true");
        } catch (Exception e) {
            modelAndView.setViewName("redirect:/?success=false");
        }
        return modelAndView;
    }
}
