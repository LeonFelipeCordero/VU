package com.ph.model

import org.springframework.data.annotation.Id
import org.springframework.data.mongodb.core.geo.GeoJsonPoint
import org.springframework.data.mongodb.core.index.CompoundIndex
import org.springframework.data.mongodb.core.index.CompoundIndexes
import org.springframework.data.mongodb.core.mapping.Document
import java.io.Serializable
import java.util.*

/**
 * Created by leon on 11/30/2017.
 */
@Document(collection = "incident")
@CompoundIndexes(CompoundIndex(name = "geolocation", def = "{'location': '2dsphere'}"))
class Incident : Serializable {

    @Id
    var _id: String? = null

    var location: GeoJsonPoint? = null
    var title: String? = null
    var description: String? = null
    var incident: String? = null
    var date: Date? = null
    var level: Int = 0

    constructor(location: GeoJsonPoint, title: String, description: String, incident: String, level: Int, date: Date) {
        this.location = location
        this.title = title
        this.description = description
        this.incident = incident
        this.level = level
        this.date = date
    }

    constructor() {}

    override fun toString(): String {
        return "Incident{" +
                "_id=" + _id!!.toString() +
                ", location=" + location!!.toString() +
                ", title='" + title + '\'' +
                ", description='" + description + '\'' +
                ", incidentService='" + incident + '\'' +
                ", date=" + date +
                ", level=" + level +
                '}'
    }

    companion object {

        private const val serialVersionUID = 1L
    }

    fun toMap(): HashMap<String, Serializable?> {
        return hashMapOf("_id" to this._id, "location" to this.location, "title" to this.title,
                "description" to this.description, "incident" to this.incident, "date" to this.date, "level" to this.level)
    }
}
