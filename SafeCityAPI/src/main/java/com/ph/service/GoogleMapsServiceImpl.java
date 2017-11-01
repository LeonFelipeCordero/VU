package com.ph.service;

import com.ph.dao.KeyDaoImpl;
import com.ph.model.Key;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

/**
 * Created by leon on 15/05/2017.
 */
@Service("safeCityGoogleMapsService")
public class GoogleMapsServiceImpl implements GoogleMapsService {

    @Autowired
    private KeyDaoImpl keyDaoImpl;

    @Override
    public Key findGoogleMapsApiKey() {
        return keyDaoImpl.getGoogleMapsApiKey();
    }

}
