package com.ph.request

data class IncidentForm(var lat: String,
                   var lng: String? = null,
                   var title: String ? = null,
                   var description: String ? = null,
                   var incident: String ? = null,
                   var date: String ? = null)
