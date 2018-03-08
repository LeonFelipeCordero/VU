package com.ph.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service("googleMapsService")
public class GoogleMapServiceImpl implements GoogleMapService {

    private final ApiService apiService;

    @Autowired
    public GoogleMapServiceImpl(ApiService apiService) {
        this.apiService = apiService;
    }

    @Override
    public String getApiKeyForPlaces() {
        return "https://maps.googleapis.com/maps/api/js?key=" +
                apiService.getApiKey() +
                "&callback=initMap&libraries=places";
    }

    @Override
    public String getApiKeyForVisualizations() {
        return "https://maps.googleapis.com/maps/api/js?key=" +
                apiService.getApiKey() +
                "&callback=initMap&libraries=visualization,places";
    }

    @Override
    public String getApiKetForAutoComplete() {
        return "https://maps.googleapis.com/maps/api/js?key=" +
                apiService.getApiKey() +
                "&callback=initAutocomplete&libraries=places";
    }


}

