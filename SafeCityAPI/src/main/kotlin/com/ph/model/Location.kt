package com.ph.model

import kotlinx.serialization.Serializable

@Serializable
data class Location(var lat: Double, var long: Double)
