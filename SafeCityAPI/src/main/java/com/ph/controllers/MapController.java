package com.ph.controllers;

import com.ph.service.GoogleMapsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class MapController {

    @Autowired
    private GoogleMapsService mapsService;

    @GetMapping(value = "/map-key")
    public String getKey(){
        return mapsService.findGoogleMapsApiKey().getValue();
    }
}
