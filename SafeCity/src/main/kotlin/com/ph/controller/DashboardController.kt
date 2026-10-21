package com.ph.controller

import com.ph.service.ApiService
import org.springframework.stereotype.Controller
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RequestParam
import org.springframework.web.servlet.ModelAndView

@Controller
class DashboardController(private val apiService: ApiService) {


    @GetMapping(value = ["/dashboard"])
    fun dashboard(modelAndView: ModelAndView): ModelAndView {
        modelAndView.viewName = "redirect:/"
        return modelAndView
    }

    @GetMapping(value = ["/statistics"])
    fun stats(modelAndView: ModelAndView,
              @RequestParam(value = "lat", required = false) lat: Double,
              @RequestParam(value = "lng", required = false) lng: Double): ModelAndView {
        getStatsOnTime(lat, lng, modelAndView)
        getDangerCount(lat, lng, modelAndView)
        modelAndView.viewName = "layout/dashboard/statistics"
        return modelAndView
    }

    private fun getStatsOnTime(lat: Double, lng: Double, modelAndView: ModelAndView) {
        val statistics = apiService.getStatistics(lat, lng)
        if (statistics.isNotEmpty()) {
            modelAndView.addObject("lastCrimes", statistics[0].statistics)
            modelAndView.addObject("lineTimeStats", statistics.map { it.timeAgo to it.statistics.sumBy { statistics -> statistics.count } })
        }
    }

    private fun getDangerCount(lat: Double, lng: Double, modelAndView: ModelAndView) =
            modelAndView.addObject("dangerCount", apiService.getDangerCount(lat, lng))
}
