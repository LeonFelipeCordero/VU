package com.ph.service

import com.ph.dto.IncidentCount
import com.ph.dto.TimeIncidentCount
import com.ph.form.IncidentForm
import com.ph.model.Incident

interface IncidentService {
    fun findNearIncidents(lat: Double, lng: Double): List<Incident>

    fun save(incident: Incident)

    fun convertFormToIncident(incidentForm: IncidentForm): Incident

    fun getStatisticsByZone(lat: Double, lng: Double): MutableList<TimeIncidentCount>
}