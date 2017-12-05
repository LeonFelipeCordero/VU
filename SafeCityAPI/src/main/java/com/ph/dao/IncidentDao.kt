package com.ph.dao

import com.ph.model.Incident

interface IncidentDao {
    fun save(incident: Incident)
    fun getNearIncidents(lat: Double, lng: Double): List<Incident>
    fun delete(incident: Incident)
}