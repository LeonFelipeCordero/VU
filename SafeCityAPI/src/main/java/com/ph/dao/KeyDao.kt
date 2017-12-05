package com.ph.dao

import com.ph.model.Key

interface KeyDao {
    fun getGoogleMapsApiKey(): Key
}