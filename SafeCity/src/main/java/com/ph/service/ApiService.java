package com.ph.service;

import com.ph.form.IncidentForm;
import com.ph.model.Incident;
import com.ph.model.StatsOnTime;
import org.springframework.http.ResponseEntity;

public interface ApiService {
    void saveIncident(IncidentForm incidentForm);

    ResponseEntity<Incident[]> getNearIncidents(double lat, double lng);

    String getApiKey();

    ResponseEntity<StatsOnTime[]> getStatistics(double lat, double lng);
}
