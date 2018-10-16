package com.ph.service

import org.springframework.stereotype.Service

@Service
class GoogleMapService(private val apiService: ApiService) {

    fun getApiKeyForPlaces(): String =
            "https://maps.googleapis.com/maps/api/js?key=" + apiService.getApiKey() + "&callback=initMap&libraries=places"

    fun getApiKeyForVisualizations(): String =
            "https://maps.googleapis.com/maps/api/js?key=" + apiService.getApiKey() + "&callback=initMap&libraries=visualization,places"

    fun getApiKetForAutoComplete(): String =
            "https://maps.googleapis.com/maps/api/js?key=" + apiService.getApiKey() + "&callback=initAutocomplete&libraries=places"
}
