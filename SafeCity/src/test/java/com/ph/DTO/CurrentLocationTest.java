package com.ph.DTO;

import com.ph.model.CurrentLocation;
import
        org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.junit4.SpringRunner;

import static org.assertj.core.api.Assertions.assertThat;


@RunWith(SpringRunner.class)
@SpringBootTest
public class CurrentLocationTest {

    private CurrentLocation currentLocation;

    @Before
    public void setUp(){
        currentLocation = new CurrentLocation(12.5, -15.5);
    }

    @Test
    public void getLatitude() throws Exception {
        assertThat(currentLocation.getLatitude()).isEqualTo(12.5);
    }

    @Test
    public void setLatitude() throws Exception {
        currentLocation.setLatitude(5.5);
        assertThat(currentLocation.getLatitude()).isEqualTo(5.5);
    }

    @Test
    public void getLongitude() throws Exception {
        assertThat(currentLocation.getLongitude()).isEqualTo(-15.5);
    }

    @Test
    public void setLongitude() throws Exception {
        currentLocation.setLongitude(-10.0);
        assertThat(currentLocation.getLongitude()).isEqualTo(-10.0);
    }

}
