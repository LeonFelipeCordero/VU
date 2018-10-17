package com.ph.model

import com.ph.serializers.DateSerializer
import com.ph.serializers.GeoJsonDeserialize
import kotlinx.serialization.Serializable
import kotlinx.serialization.Serializer
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
        @Serializable(with = GeoJsonDeserialize::class) val location: GeoJsonPoint,
        val title: String,
        val description: String,
        val incident: String,
        val level: Int,
        @Serializable(with = DateSerializer::class) val date: Date) {
    @Id var _id: String? = null
}
