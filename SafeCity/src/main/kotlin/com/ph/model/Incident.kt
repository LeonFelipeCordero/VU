package com.ph.model

import java.util.*

data class Incident(var _id: String,
                    var location: CurrentLocation,
                    var title: String,
                    var description: String,
                    var incident: String,
                    var date: Date,
                    var level: Int)
