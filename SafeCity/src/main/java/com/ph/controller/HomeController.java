package com.ph.controller;

import com.ph.service.GoogleMapService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.servlet.ModelAndView;


/**
 * Created by leon on 23/04/2017.
 */
@Controller
public class HomeController {

    private final GoogleMapService googleMapService;

    @Autowired
    public HomeController(GoogleMapService googleMapService) {
        this.googleMapService = googleMapService;
    }

    @GetMapping(value = "/")
    public ModelAndView home(ModelAndView modelAndView,
                             @RequestParam(value = "success", required = false) boolean success) {
        modelAndView.addObject("apiKey", googleMapService.getApiKeyForPlaces());
        setFlag(modelAndView, success);
        modelAndView.addObject("description", "Vigiles Urbani | help to have a safe city | Map");
        modelAndView.addObject("title", "Vigiles Urbani | mark any crime in your city to help having better and more safety cities ");
        modelAndView.addObject("normalMap", true);
        modelAndView.setViewName("index");
        return modelAndView;
    }

    private void setFlag(ModelAndView modelAndView, Boolean success) {
        if (success != null && success){
            modelAndView.addObject("status", true);
        }
    }
}
