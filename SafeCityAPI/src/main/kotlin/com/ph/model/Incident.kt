package com.ph.model

import kotlinx.serialization.Serializable
import org.springframework.data.annotation.Id
import org.springframework.data.mongodb.core.geo.GeoJsonPoint
import org.springframework.data.mongodb.core.index.CompoundIndex
import org.springframework.data.mongodb.core.index.CompoundIndexes
import org.springframework.data.mongodb.core.mapping.Document
import java.util.*

/**
 * Created by leon on 11/30/2017.
 */
@Serializable
@Document(collection = "incident")
@CompoundIndexes(CompoundIndex(name = "geolocation", def = "{'location': '2dsphere'}"))
data class Incident(
        val location: GeoJsonPoint,
        val title: String,
        val description: String,
        val incident: String,
        val level: Int,
        val date: Date) {
    @Id var _id: String? = null
}
