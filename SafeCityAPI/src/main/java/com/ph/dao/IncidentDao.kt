package com.ph.dao

import com.ph.dto.IncidentCount
import com.ph.dto.TimeIncidentCount
import com.ph.model.Incident

interface IncidentDao {
    fun save(incident: Incident)
    fun getNearIncidents(lat: Double, lng: Double): List<Incident>
    fun getStatistics(lat: Double, lng: Double): MutableList<TimeIncidentCount>
}