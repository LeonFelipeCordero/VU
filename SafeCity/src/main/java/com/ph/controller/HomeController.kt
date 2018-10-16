package com.ph.controller

import com.ph.service.GoogleMapService
import org.springframework.stereotype.Controller
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RequestParam
import org.springframework.web.servlet.ModelAndView

@Controller
class HomeController(private val googleMapService: GoogleMapService) {


    @GetMapping(value = ["/"])
    fun home(modelAndView: ModelAndView,
             @RequestParam(value = "success", required = false) success: Boolean): ModelAndView {
        modelAndView.addObject("apiKey", googleMapService.getApiKeyForPlaces())
        setFlag(modelAndView, success)
        modelAndView.addObject("description", "Vigiles Urbani | help to have a safe city | Map")
        modelAndView.addObject("title", "Vigiles Urbani | mark any crime in your city to help having better and more safety cities ")
        modelAndView.addObject("normalMap", true)
        modelAndView.viewName = "index"
        return modelAndView
    }

    private fun setFlag(modelAndView: ModelAndView, success: Boolean?) {
        success?.let {
            if (it) {
                modelAndView.addObject("status", it)
            }
        }
    }
}
