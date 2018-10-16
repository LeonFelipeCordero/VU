package com.ph.model

import kotlinx.serialization.Serializable
import org.springframework.data.mongodb.core.geo.GeoJsonPoint
import java.util.*

@Serializable
data class Incident(var _id: String,
                    var location: GeoJsonPoint,
                    var title: String,
                    var description: String,
                    var incident: String,
                    var date: Date,
                    var level: Int)
