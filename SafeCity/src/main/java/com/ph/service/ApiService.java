package com.ph.service;

import com.ph.form.IncidentForm;
import com.ph.model.Incident;
import org.springframework.http.ResponseEntity;

public interface ApiService {
    void saveIncident(IncidentForm incidentForm);

    ResponseEntity<Incident[]> getNearIncidents(double lat, double lng);

    String getApiKey();
}
