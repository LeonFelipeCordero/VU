//package com.ph.dao;
//
//import com.ph.model.Incident;
//import org.junit.After;
//import org.junit.Before;
//import org.junit.Test;
//import org.junit.runner.RunWith;
//import org.springframework.beans.factory.annotation.Autowired;
//import org.springframework.boot.test.context.SpringBootTest;
//import org.springframework.data.geo.Point;
//import org.springframework.data.mongodb.core.geo.GeoJsonPoint;
//import org.springframework.test.context.junit4.SpringRunner;
//
//import java.util.Date;
//import java.util.List;
//
//import static org.assertj.core.api.Assertions.assertThat;
//
//
//@RunWith(SpringRunner.class)
//@SpringBootTest
//public class IncidentDaoTest {
//
//    @Autowired
//    private IncidentDao incidentDao;
//
//
//    @Before
//    public void setUp(){
//        Incident incident = new Incident(new GeoJsonPoint(new Point(12.2, -15.5)),
//                "title",
//                "description",
//                "incident",
//                5,
//                new Date());
//        incidentDao.save(incident);
//    }
//
//    @After
//    public void after(){
//        List<Incident> incidents = incidentDao.getNearIncidents(-15.5, 12.2);
//        assertThat(incidents.size()).isEqualTo(0);
//    }
//
//    @Test
//    public void testNearLocations(){
//        List<Incident> incidents = incidentDao.getNearIncidents(-15.5, 12.2);
//        assertThat(incidents.size()).isGreaterThan(0);
//        incidents.forEach(incident -> incidentDao.delete(incident));
//    }
//}
