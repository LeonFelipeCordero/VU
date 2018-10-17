package com.ph.model

import kotlinx.serialization.Serializable

@Serializable
data class CurrentLocation(var x: Double, var y: Double, var type: String, var coordinates: MutableList<Double>)
