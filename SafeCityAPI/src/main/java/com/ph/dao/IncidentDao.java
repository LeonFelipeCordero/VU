package com.ph.dao;

import com.ph.model.Incident;

import java.util.List;

public interface IncidentDao {

    void save(Incident incident);
    List<Incident> getNearIncidents(double lat, double lng);
    void delete(Incident incident);

}
