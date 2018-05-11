package ph.backend.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;
import ph.backend.services.GoogleMapsService;

@RestController
public class GoogleController {

    private GoogleMapsService googleMapsService;

    @Autowired
    public GoogleController(GoogleMapsService googleMapsService){
        this.googleMapsService = googleMapsService;
    }

    @CrossOrigin(origins = "http://${frontend.host}:8080")
    @GetMapping(value = "/key")
    public String geyKey(){
        return googleMapsService.getApiKeyForPlaces();
    }
}
