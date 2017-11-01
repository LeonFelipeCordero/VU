package com.ph.controllers;

import com.ph.form.IncidentForm;
import com.ph.model.Incident;
import com.ph.service.IncidentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
public class IncidentController {

    @Autowired
    private IncidentService incidentService;

    @GetMapping(value = "/incident/near", produces = MediaType.APPLICATION_JSON_VALUE)
    public List<Incident> nearIncidents(@RequestParam(value = "lat") double lat,
                                        @RequestParam(value = "lng") double lng) {
        return incidentService.findNearIncidents(lat, lng);
    }

    @PutMapping(value = "/save-incident")
    public ResponseEntity<?> saveIncident(@RequestBody IncidentForm incidentForm) {
        try {
            incidentService.save(incidentService.convertFormToIncident(incidentForm));
            return new ResponseEntity<>("success", HttpStatus.ACCEPTED);
        } catch (Exception e) {
            return new ResponseEntity<>("error", HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}
