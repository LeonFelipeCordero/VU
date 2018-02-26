package com.ph.model

import org.bson.types.ObjectId
import org.springframework.data.annotation.Id
import org.springframework.data.mongodb.core.mapping.Document
import java.io.Serializable

@Document(collection = "keys")
data class Key constructor(
        val name: String,
        val value: String) : Serializable {

    @Id
    var _id: ObjectId? = null

    var provider: String? = null
    val description: String? = null

    override fun toString(): String =
            "Key{" +
                    "_id=" + _id +
                    ", name='" + name + '\'' +
                    ", value='" + value + '\'' +
                    ", provider='" + provider + '\'' +
                    ", description='" + description + '\'' +
                    '}'


    companion object {
        const val serialVersionUID = 1L
    }
}
