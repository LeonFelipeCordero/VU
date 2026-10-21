package com.ph.model

import org.springframework.data.annotation.Id
import org.springframework.data.mongodb.core.mapping.Document

@Document(collection = "keys")
data class Key (
        val name: String,
        val value: String,
        val provider: String,
        val description: String) {

    @Id
    var _id: String? = null
}
