package com.ph.service;

import com.ph.form.IncidentForm;
import com.ph.model.Incident;

import java.util.List;

public interface IncidentService {
    List<Incident> findNearIncidents(double lat, double lng);

    void save(Incident incident);

    Incident convertFormToIncident(IncidentForm incidentForm);
}
