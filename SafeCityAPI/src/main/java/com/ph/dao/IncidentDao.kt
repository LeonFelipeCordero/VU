package com.ph.dao

import com.ph.dto.Danger
import com.ph.dto.DangerCount
import com.ph.dto.TimeIncidentCount
import com.ph.model.Incident

interface IncidentDao {
    fun save(incident: Incident)
    fun getNearIncidents(lat: Double, lng: Double): List<Incident>
    fun getStatistics(lat: Double, lng: Double): MutableList<TimeIncidentCount>
    fun getDangerCount(lat: Double, lng: Double): Danger
}