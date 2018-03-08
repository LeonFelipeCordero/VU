package com.ph.service;

import com.ph.form.IncidentForm;
import com.ph.model.DangerCount;
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
    private BasicAuthRestTemplate basicAuthRestTemplate;

    @Autowired
    public ApiServiceImpl(Environment environment, BasicAuthRestTemplate basicAuthRestTemplate) {
        this.environment = environment;
        this.basicAuthRestTemplate = basicAuthRestTemplate;
    }

    @Override
    @Async
    public void saveIncident(IncidentForm incidentForm) {
        String hostName = environment.getProperty("api.hostname");
        basicAuthRestTemplate.postForObject("http://" + hostName + ":8081/save-incident", incidentForm, Incident.class);
//        BasicAuthRestTemplate restTemplate = new BasicAuthRestTemplate("SafeCity", "SafeCity");
//        restTemplate.postForObject("http://" + hostName + ":8081/save-incident", incidentForm, Incident.class);
    }

    @Override
    public ResponseEntity<Incident[]> getNearIncidents(double lat, double lng) {
        String hostName = environment.getProperty("api.hostname");
        return basicAuthRestTemplate.getForEntity("http://" + hostName + ":8081/incident/near?lat=" + lat + "&lng=" + lng, Incident[].class);
//        BasicAuthRestTemplate restTemplate = new BasicAuthRestTemplate("SafeCity", "SafeCity");
//        return restTemplate.getForEntity("http://" + hostName + ":8081/incident/near?lat=" + lat + "&lng=" + lng, Incident[].class);
    }

    @Override
    public String getApiKey() {
        String hostName = environment.getProperty("api.hostname");
        return basicAuthRestTemplate.getForObject("http://" + hostName + ":8081/map-key", String.class);
//        BasicAuthRestTemplate restTemplate = new BasicAuthRestTemplate("SafeCity", "SafeCity");
//        return restTemplate.getForObject("http://" + hostName + ":8081/map-key", String.class);
    }

    @Override
    public ResponseEntity<StatsOnTime[]> getStatistics(double lat, double lng) {
        String hostName = environment.getProperty("api.hostname");
        return basicAuthRestTemplate.getForEntity("http://"+ hostName + ":8081/statistics?lat=" + lat + "&lng=" + lng, StatsOnTime[].class);
//        BasicAuthRestTemplate restTemplate = new BasicAuthRestTemplate("SafeCity", "SafeCity");
//        return restTemplate.getForEntity("http://api:8081/incident/near?lat=" + lat + "&lng=" + lng, StatsOnTime[].class);
    }

    @Override
    public DangerCount getDangerCount(double lat, double lng) {
        String hostName = environment.getProperty("api.hostname");
        return basicAuthRestTemplate.getForObject("http://"+ hostName + ":8081/danger-count?lat=" + lat + "&lng=" + lng, DangerCount.class);
    }

}
