package com.ph.request

import javax.validation.constraints.NotNull

data class IncidentRequest(
        val lat: String, @NotNull
        val lng: String, @NotNull
        val title: String, @NotNull
        val description: String, @NotNull
        val incident: String, @NotNull
        val date: String)
