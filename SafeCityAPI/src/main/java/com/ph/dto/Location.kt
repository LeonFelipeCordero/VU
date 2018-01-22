package com.ph.dto

data class Location constructor(var lat: Double?, var long: Double?) {

    override fun toString(): String {
        return "lat: $lat, long: $long"
    }
}