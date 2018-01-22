package com.ph.model

//import org.bson.types.ObjectId
//import org.springframework.data.annotation.Id
//import org.springframework.data.mongodb.core.mapping.Document
//import java.io.Serializable

//@Document(collection = "keys")
class Key {

//    @Id
//    var _id: ObjectId? = null

    var name: String? = null
    var value: String? = null
    var provider: String? = null
    var description: String? = null

    fun constructor(name: String, value: String, privider: String, description: String) {
        this.name = name
        this.value = value
        this.provider = privider
        this.description = description
    }

    fun constructor() {}

    override fun toString(): String =
                "Key{" +
//                "_id=" + _id +
                ", name='" + name + '\'' +
                ", value='" + value + '\'' +
                ", provider='" + provider + '\'' +
                ", description='" + description + '\'' +
                '}'


    companion object {
        const val serialVersionUID = 1L
    }
}
