package com.ph;

import com.ph.controller.HomeController;
import com.ph.controller.IncidentController;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.junit4.SpringRunner;

import javax.inject.Inject;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * Created by leon on 31/07/17.
 */
@RunWith(SpringRunner.class)
@SpringBootTest
public class SmokeTest {

    @Inject
    private HomeController homeController;

    @Inject
    private IncidentController incidentController;

    @Test
    public void contextLoads(){
        assertThat(homeController).isNotNull();
        assertThat(incidentController).isNotNull();
    }
}
