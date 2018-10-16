package com.ph.controller;

import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.junit4.SpringRunner;
import org.springframework.web.servlet.ModelAndView;

@RunWith(SpringRunner.class)
@SpringBootTest
public class DashboardControllerTest {

    @Autowired
    private DashboardController dashboardController;

    @Test
    public void stats() {
        ModelAndView stats = dashboardController.stats(new ModelAndView(), 28.565033, -106.010761);
        assert stats.getModel().size() > 0;
    }
}
