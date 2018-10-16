package com.ph.model

import kotlinx.serialization.Serializable
import org.springframework.data.annotation.Id
import org.springframework.data.mongodb.core.mapping.Document

@Serializable
@Document(collection = "keys")
data class Key (
        val name: String,
        val value: String,
        val provider: String,
        val description: String) {

    @Id
    var _id: String? = null
}
