package com.ph.request

import org.springframework.data.mongodb.core.geo.GeoJsonPoint
import java.util.*

data class PostIncident(var _id: String,
                        var location: GeoJsonPoint,
                        var title: String,
                        var description: String,
                        var incident: String,
                        var date: Date,
                        var level: Int)
