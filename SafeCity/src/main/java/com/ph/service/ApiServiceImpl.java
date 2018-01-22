package com.ph.service;

import com.ph.form.IncidentForm;
import com.ph.model.Incident;
import com.ph.rest.template.BasicAuthRestTemplate;
import org.springframework.http.ResponseEntity;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Service("apiService")
public class ApiServiceImpl implements ApiService {
    @Override
    @Async
    public void saveIncident(IncidentForm incidentForm) {
        BasicAuthRestTemplate restTemplate = new BasicAuthRestTemplate("SafeCity", "SafeCity");
        restTemplate.put("http://localhost:8081/save-incident", incidentForm);
    }

    @Override
    public ResponseEntity<Incident[]> getNearIncidents(double lat, double lng) {
        BasicAuthRestTemplate restTemplate = new BasicAuthRestTemplate("SafeCity", "SafeCity");
        return restTemplate.getForEntity("http://localhost:8081/incident/near?lat=" + lat + "&lng=" + lng, Incident[].class);
    }

    @Override
    public String getApiKey() {
        BasicAuthRestTemplate restTemplate = new BasicAuthRestTemplate("SafeCity", "SafeCity");
        return restTemplate.getForObject("http://localhost:8081/map-key", String.class);
    }
}
