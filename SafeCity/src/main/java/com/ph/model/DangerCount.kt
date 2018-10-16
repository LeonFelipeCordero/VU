package com.ph.model

import kotlinx.serialization.Serializable

@Serializable
data class DangerCount(var level: String, var total: Int)
