package com.ph.controller;

import com.google.maps.GeoApiContext;
import com.google.maps.GeolocationApi;
import com.google.maps.GeolocationApiRequest;
import com.google.maps.internal.LatLngAdapter;
import com.ph.model.StatsOnTime;
import com.ph.service.ApiService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.method.P;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.servlet.ModelAndView;

import java.util.Collections;

@Controller
public class DashboardController {

    private ApiService apiService;

    @Autowired
    public DashboardController(ApiService apiService) {
        this.apiService = apiService;
    }

    @GetMapping(value = "/dashboard")
    public ModelAndView dashboard(ModelAndView modelAndView,
                                    @RequestParam(value = "address", required = false) String address) {
        /**
         * TODO
         * - crimes per zone
         * - percentage
         * - types stats --- type, 6m, 1y, 2y
         * **/
//        GeoApiContext context = new GeoApiContext.Builder()
//                .apiKey(apiService.getApiKey())
//                .build();
//        GeolocationApiRequest newRequest = GeolocationApi.newRequest(context);

//        LatLngAdapter latLngAdapter = new LatLngAdapter();


//        ResponseEntity<StatsOnTime[]> statistics = apiService.getStatistics(lat, lng);
//        modelAndView.addObject("stats", Collections.singletonList(statistics));
        if(address == null){

        }else{
//            modelAndView.addObject("lat", lat);
//            modelAndView.addObject("lng", lng);
        }
        modelAndView.setViewName("layout/dashboard/dashboard");
        return modelAndView;
    }
}
