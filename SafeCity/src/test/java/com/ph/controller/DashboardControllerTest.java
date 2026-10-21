package com.ph.controller;

import com.ph.config.PropertiesConfiguration;
import com.ph.rest.template.BasicAuthRestTemplate;
import com.ph.service.ApiService;
import org.junit.Test;
import org.springframework.web.servlet.ModelAndView;

import static org.junit.Assert.assertEquals;

public class DashboardControllerTest {
    @Test
    public void legacyDashboardReturnsToTheSingleMapScreen() {
        ApiService api = new ApiService(new BasicAuthRestTemplate(), new PropertiesConfiguration());
        ModelAndView view = new DashboardController(api).dashboard(new ModelAndView());
        assertEquals("redirect:/", view.getViewName());
    }
}
