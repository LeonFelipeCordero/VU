package com.ph.controllers

import com.ph.service.GoogleMapsService
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RestController

@RestController
class   MapController(private val mapsService: GoogleMapsService) {

    @GetMapping(value = ["/map-key"])
    fun getKey(): String? = mapsService.findGoogleMapsApiKey().value
}
