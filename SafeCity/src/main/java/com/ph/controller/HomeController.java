package com.ph.controller;

import com.google.maps.errors.ApiException;
//import com.google.protobuf.Api;
import com.ph.rest.template.BasicAuthRestTemplate;
import com.ph.service.ApiService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.servlet.ModelAndView;

import java.io.IOException;

/**
 * Created by leon on 23/04/2017.
 */
@Controller()
public class HomeController {

    @Autowired
    private ApiService apiService;

    @GetMapping(value = "/")
    public ModelAndView home(ModelAndView modelAndView,
                             @RequestParam(value = "success", required = false) boolean success)
            throws InterruptedException, ApiException, IOException {
        BasicAuthRestTemplate restTemplate = new BasicAuthRestTemplate("SafeCity", "SafeCity");
        modelAndView.addObject("apiKey",
                "https://maps.googleapis.com/maps/api/js?key="
                        + apiService.getApiKey()
                        + "&callback=initMap&libraries=places");
        setFlag(modelAndView, success);
        modelAndView.addObject("description", "Vigiles Urbani | help to have a safe city | map");
        modelAndView.addObject("title", "Vigiles Urbani | mark any incident in your city to help having better and more safety cities ");
        modelAndView.setViewName("index");
        return modelAndView;
    }

    private void setFlag(ModelAndView modelAndView, Boolean success) {
        if (success != null && success){
            modelAndView.addObject("status", success);
        }
    }
}
