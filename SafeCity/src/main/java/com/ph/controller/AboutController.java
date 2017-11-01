package com.ph.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.servlet.ModelAndView;

@Controller
public class AboutController {

    @GetMapping(value = "/about")
    public ModelAndView aboutUs(ModelAndView modelAndView){
        modelAndView.setViewName("layout/aboutUs/about-us");
        modelAndView.addObject("description", "Vigiles Urbani | about vigiles urbani | about");
        modelAndView.addObject("title", "Vigiles Urbani | an application made to have better and more");
        return modelAndView;
    }
}
