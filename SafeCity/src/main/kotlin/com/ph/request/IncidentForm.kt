package com.ph.request

import javax.validation.constraints.DecimalMax
import javax.validation.constraints.DecimalMin
import javax.validation.constraints.NotBlank
import javax.validation.constraints.Pattern
import javax.validation.constraints.Size

data class IncidentForm(
        @field:NotBlank @field:DecimalMin("-90") @field:DecimalMax("90") var lat: String,
        @field:NotBlank @field:DecimalMin("-180") @field:DecimalMax("180") var lng: String? = null,
        @field:NotBlank @field:Size(max = 120) var title: String? = null,
        @field:NotBlank @field:Size(max = 2000) var description: String? = null,
        @field:NotBlank
        @field:Pattern(regexp = "Fight|Big Fight|Thievery|Establishment Thievery|House Thievery|Shooting|Murder|Drugs|Police Arrest|kidnapping|Rape|Other")
        var incident: String? = null,
        @field:NotBlank @field:Pattern(regexp = "[0-9]{4}-[0-9]{2}-[0-9]{2}T[0-9]{2}:[0-9]{2}") var date: String? = null)
