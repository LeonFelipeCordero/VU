//package com.ph.service;
//
//import com.ph.form.IncidentForm;
//import com.ph.model.Incident;
//import org.junit.Test;
//import org.junit.runner.RunWith;
//import org.springframework.beans.factory.annotation.Autowired;
//import org.springframework.boot.test.context.SpringBootTest;
//import org.springframework.test.context.junit4.SpringRunner;
//
//import java.io.IOException;
//import java.util.Date;
//
//import static org.assertj.core.api.Assertions.assertThat;
//
///**
// * Created by leon on 28/05/2017.
// */
//@RunWith(SpringRunner.class)
//@SpringBootTest
//public class IncidentServiceTest {
//
//    @Autowired
//    private IncidentServiceImpl incidentServiceImpl;
//
//    @Test
//    public void testConcertFormToIncident() throws IOException {
//        Incident incident = incidentServiceImpl.convertFormToIncident(new IncidentForm(
//                "12.5",
//                "-15",
//                "title",
//                "description",
//                "Fight",
//                "2017-31-12T11:11"));
//
//        assertThat(incident.getLocation().getCoordinates().get(0)).isEqualTo(-15);
//        assertThat(incident.getLocation().getCoordinates().get(1)).isEqualTo(12.5);
//        assertThat(incident.getTitle()).isEqualTo("title");
//        assertThat(incident.getDescription()).isEqualTo("description");
//        assertThat(incident.getIncident()).isEqualTo("Fight");
//        assertThat(incident.getLevel()).isEqualTo(1);
//    }
//}
