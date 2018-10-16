package com.ph.model

import kotlinx.serialization.Serializable

@Serializable
data class TimeIncidentCount (val timeAgo: String, val statistics: List<IncidentCount>)
