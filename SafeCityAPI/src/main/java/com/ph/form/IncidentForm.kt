package com.ph.form

import com.fasterxml.jackson.annotation.JsonCreator
import java.io.Serializable
import javax.validation.constraints.NotNull

data class IncidentForm @JsonCreator constructor(
        @NotNull
        val lat: String, @NotNull
        val lng: String, @NotNull
        val title: String, @NotNull
        val description: String, @NotNull
        val incident: String, @NotNull
        val date: String) : Serializable