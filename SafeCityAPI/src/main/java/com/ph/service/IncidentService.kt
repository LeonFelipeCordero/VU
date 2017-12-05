package com.ph.service

import com.ph.form.IncidentForm
import com.ph.model.Incident

interface IncidentService {
    fun findNearIncidents(lat: Double, lng: Double): List<Incident>

    fun save(incident: Incident)

    fun convertFormToIncident(incidentForm: IncidentForm): Incident
}