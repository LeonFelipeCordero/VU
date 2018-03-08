package com.ph.controller;

import com.ph.model.Statistics;
import com.ph.model.StatsOnTime;
import com.ph.service.ApiService;
import com.ph.service.GoogleMapService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.servlet.ModelAndView;

import java.util.Arrays;
import java.util.HashMap;
import java.util.List;

@Controller
public class DashboardController {

    private ApiService apiService;
    private GoogleMapService googleMapService;

    @Autowired
    public DashboardController(ApiService apiService, GoogleMapService googleMapService) {
        this.apiService = apiService;
        this.googleMapService = googleMapService;
    }

    @GetMapping(value = "/dashboard")
    public ModelAndView dashboard(ModelAndView modelAndView) {
        modelAndView.addObject("apiKey", googleMapService.getApiKetForAutoComplete());
        modelAndView.addObject("dashboard", true);
        modelAndView.setViewName("layout/dashboard/dashboard");
        return modelAndView;
    }

    @GetMapping(value = "/statistics")
    public ModelAndView stats(ModelAndView modelAndView,
                              @RequestParam(value = "lat", required = false) Double lat,
                              @RequestParam(value = "lng", required = false) Double lng) {
        if (lat != null && lng != null) {
            getStatsOnTime(lat, lng, modelAndView);
            getDangerCount(lat, lng, modelAndView);
        }
        modelAndView.setViewName("layout/dashboard/statistics");
        return modelAndView;
    }

    private void getStatsOnTime(double lat, double lng, ModelAndView modelAndView) {
        List<StatsOnTime> statistics = Arrays.asList(apiService.getStatistics(lat, lng).getBody());
        if (statistics.size() > 0) {
            modelAndView.addObject("lastCrimes", statistics.get(0).getStatistics());
            HashMap<String, Integer> lineTimeStats = new HashMap<>();
            statistics.forEach(statsOnTime ->
                    lineTimeStats.put(statsOnTime.getTimeAgo(),
                            statsOnTime.getStatistics().stream().mapToInt(Statistics::getCount).sum()));
            modelAndView.addObject("lineTimeStats", lineTimeStats);
        }
    }

    private void getDangerCount(Double lat, Double lng, ModelAndView modelAndView) {
        modelAndView.addObject("dangerCount", apiService.getDangerCount(lat, lng));
    }
}
