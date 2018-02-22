package com.ph.controller;

import com.ph.service.GoogleMapService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.servlet.ModelAndView;

@Controller
public class HotZonesController {

    private final GoogleMapService googleMapService;

    @Autowired
    public HotZonesController(GoogleMapService googleMapService) {
        this.googleMapService = googleMapService;
    }

    @GetMapping(value = "/hot-zones")
    public ModelAndView hotZones(ModelAndView modelAndView) {
        modelAndView.addObject("apiKey", googleMapService.getApiKeyForVisualizations());
        modelAndView.addObject("description", "Vigiles Urbani | help to have a safe city | Hot Zones");
        modelAndView.addObject("title", "Vigiles Urbani | mark any crime in your city to help having better and more safety cities ");
        modelAndView.setViewName("/index");
        return modelAndView;
    }
}
