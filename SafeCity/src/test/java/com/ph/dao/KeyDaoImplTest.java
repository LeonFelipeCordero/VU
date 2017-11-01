//package com.ph.dao;
//
//import com.ph.model.Key;
//import org.junit.Test;
//import org.junit.runner.RunWith;
//import org.springframework.beans.factory.annotation.Autowired;
//import org.springframework.boot.test.context.SpringBootTest;
//import org.springframework.test.context.junit4.SpringRunner;
//
//import javax.inject.Inject;
//import java.net.UnknownHostException;
//
//import static org.junit.Assert.assertNotNull;
//
///**
// * Created by leon on 31/07/17.
// */
//@RunWith(SpringRunner.class)
//@SpringBootTest()
//public class KeyDaoImplTest {
//
//    @Autowired
//    private KeyDao keyDao;
//
//    @Test
//    public void testGetGoogleApiKey() throws UnknownHostException {
//        Key key = keyDao.getGoogleMapsApiKey();
//        assertNotNull(key);
//    }
//}