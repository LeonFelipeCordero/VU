package com.ph.model

import kotlinx.serialization.Serializable

@Serializable
data class Danger(val level: String, var total: Int)
