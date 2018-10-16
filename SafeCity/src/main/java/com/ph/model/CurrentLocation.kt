package com.ph.model

import kotlinx.serialization.Serializable

@Serializable
data class CurrentLocation(var latitude: Double, var longitude: Double)
