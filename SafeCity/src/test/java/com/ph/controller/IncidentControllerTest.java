package com.ph.controller;

import com.ph.config.PropertiesConfiguration;
import com.ph.rest.template.BasicAuthRestTemplate;
import com.ph.service.ApiService;
import org.junit.Before;
import org.junit.Test;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.test.web.client.MockRestServiceServer;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import static org.springframework.test.web.client.match.MockRestRequestMatchers.requestTo;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.method;
import static org.springframework.test.web.client.response.MockRestResponseCreators.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

public class IncidentControllerTest {
    private MockMvc mvc;
    private MockRestServiceServer api;
    private final String report = "{\"lat\":\"28.640033\",\"lng\":\"-106.073761\","
            + "\"title\":\"Broken window\",\"description\":\"Window damaged near the park\","
            + "\"incident\":\"Other\",\"date\":\"2026-10-20T12:30\"}";

    @Before
    public void setup() {
        BasicAuthRestTemplate template = new BasicAuthRestTemplate();
        PropertiesConfiguration config = new PropertiesConfiguration();
        config.setHost("http://incident-api");
        api = MockRestServiceServer.createServer(template);
        mvc = MockMvcBuilders.standaloneSetup(new IncidentController(new ApiService(template, config))).build();
    }

    @Test
    public void savesCoordinatesAndDetailsWithoutRedirecting() throws Exception {
        api.expect(requestTo("http://incident-api/save-incident"))
                .andExpect(method(HttpMethod.POST))
                .andExpect(org.springframework.test.web.client.match.MockRestRequestMatchers.content().json(report))
                .andRespond(withStatus(org.springframework.http.HttpStatus.ACCEPTED)
                        .body("incident processed").contentType(MediaType.TEXT_PLAIN));
        mvc.perform(post("/save-incident").contentType(MediaType.APPLICATION_JSON).content(report))
                .andExpect(status().isOk()).andExpect(content().string("Incident saved"));
        api.verify();
    }

    @Test
    public void rejectsMissingDetailsAndInvalidCoordinatesBeforeCallingApi() throws Exception {
        mvc.perform(post("/save-incident").contentType(MediaType.APPLICATION_JSON)
                .content(report.replace("28.640033", "91"))).andExpect(status().isBadRequest());
        mvc.perform(post("/save-incident").contentType(MediaType.APPLICATION_JSON)
                .content(report.replace("Broken window", ""))).andExpect(status().isBadRequest());
        mvc.perform(post("/save-incident").contentType(MediaType.APPLICATION_JSON)
                .content(report.replace("Other", "not-a-type"))).andExpect(status().isBadRequest());
        api.verify();
    }

    @Test
    public void reportsApiFailureInsteadOfFalseSuccess() throws Exception {
        api.expect(requestTo("http://incident-api/save-incident")).andRespond(withServerError());
        mvc.perform(post("/save-incident").contentType(MediaType.APPLICATION_JSON).content(report))
                .andExpect(status().isBadGateway());
        api.verify();
    }
}
