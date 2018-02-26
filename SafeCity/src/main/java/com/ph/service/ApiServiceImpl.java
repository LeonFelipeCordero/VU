package com.ph.service;

import com.ph.form.IncidentForm;
import com.ph.model.Incident;
import com.ph.model.StatsOnTime;
import com.ph.rest.template.BasicAuthRestTemplate;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.env.Environment;
import org.springframework.http.ResponseEntity;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Service("apiService")
public class ApiServiceImpl implements ApiService {

    private Environment environment;

    @Autowired
    public ApiServiceImpl(Environment environment) {
        this.environment = environment;
    }

    @Override
    @Async
    public void saveIncident(IncidentForm incidentForm) {
        String hostName = environment.getProperty("api.hostname");
        BasicAuthRestTemplate restTemplate = new BasicAuthRestTemplate("SafeCity", "SafeCity");
        restTemplate.postForObject("http://" + hostName + ":8081/save-incident", incidentForm, Incident.class);
    }

    @Override
    public ResponseEntity<Incident[]> getNearIncidents(double lat, double lng) {
        String hostName = environment.getProperty("api.hostname");
        BasicAuthRestTemplate restTemplate = new BasicAuthRestTemplate("SafeCity", "SafeCity");
        return restTemplate.getForEntity("http://" + hostName + ":8081/incident/near?lat=" + lat + "&lng=" + lng, Incident[].class);
    }

    @Override
    public String getApiKey() {
        String hostName = environment.getProperty("api.hostname");
        BasicAuthRestTemplate restTemplate = new BasicAuthRestTemplate("SafeCity", "SafeCity");
        return restTemplate.getForObject("http://" + hostName + ":8081/map-key", String.class);
    }

    @Override
    public ResponseEntity<StatsOnTime[]> getStatistics(double lat, double lng) {
        String hostName = environment.getProperty("api.hostname");
        BasicAuthRestTemplate restTemplate = new BasicAuthRestTemplate("SafeCity", "SafeCity");
        return restTemplate.getForEntity("http://api:8081/incident/near?lat=" + lat + "&lng=" + lng, StatsOnTime[].class);
    }

}
