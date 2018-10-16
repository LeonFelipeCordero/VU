package com.ph.controller

import com.ph.service.GoogleMapService
import org.springframework.stereotype.Controller
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.servlet.ModelAndView

@Controller
class HotZonesController(private val googleMapService: GoogleMapService) {

    @GetMapping(value = ["/hot-zones"])
    fun hotZones(modelAndView: ModelAndView): ModelAndView {
        modelAndView.addObject("apiKey", googleMapService.getApiKeyForVisualizations())
        modelAndView.addObject("description", "Vigiles Urbani | help to have a safe city | Hot Zones")
        modelAndView.addObject("title", "Vigiles Urbani | mark any crime in your city to help having better and more safety cities ")
        modelAndView.addObject("hotMap", true)
        modelAndView.viewName = "/index"
        return modelAndView
    }
}
