package com.ph.model

import kotlinx.serialization.Serializable

@Serializable
data class Key(var name: String,
               var value: String,
               var privider: String,
               var description: String)
