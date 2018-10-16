package com.ph.request

import org.jetbrains.annotations.NotNull
import kotlin.math.ln


data class IncidentForm(var lat: String, var lng: String) {
    constructor(lat: String, lng: String, title: String, description: String, incident: String, date: String) : this(lat, lng)
}
