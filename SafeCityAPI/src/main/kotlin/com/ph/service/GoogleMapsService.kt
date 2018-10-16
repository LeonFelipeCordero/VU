package com.ph.service

import com.ph.model.Key
import com.ph.repository.KeyRepository
import org.springframework.stereotype.Service

@Service
open class GoogleMapsService(private val keyRepository: KeyRepository) {

    fun findGoogleMapsApiKey(): Key = keyRepository.findKeyByName("google.api")

}
