package com.ph.service

import com.ph.dao.KeyDao
import com.ph.model.Key
import org.springframework.stereotype.Service

@Service("safeCityGoogleMapsService")
class GoogleMapsServiceImpl(private val keyDao: KeyDao) : GoogleMapsService {

    override fun findGoogleMapsApiKey(): Key = keyDao.getGoogleMapsApiKey()

}