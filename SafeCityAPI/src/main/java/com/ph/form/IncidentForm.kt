package com.ph.form

import java.io.Serializable
import javax.validation.constraints.NotNull

class IncidentForm(@NotNull
                   val lat: String, @NotNull
                   val lng: String, @NotNull
                   val title: String, @NotNull
                   val description: String, @NotNull
                   val incident: String, @NotNull
                   val date: String) : Serializable