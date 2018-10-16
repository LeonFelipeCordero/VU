package com.ph.model

import kotlinx.serialization.Serializable

@Serializable
data class Statistics(var incident: String, var count: Int)
