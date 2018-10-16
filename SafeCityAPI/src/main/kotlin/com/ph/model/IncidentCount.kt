package com.ph.model

import kotlinx.serialization.Serializable

@Serializable
data class IncidentCount(var incident: String, var count: Long)
