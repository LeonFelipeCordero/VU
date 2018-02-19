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
data class Incident constructor(
        val location: GeoJsonPoint,
        val title: String,
        val description: String,
        val incident: String,
        val level: Int,
        val date: Date) : Serializable {

    @Id
    var _id: String? = null

    override fun toString(): String {
        return "Incident{" +
                "_id=" + _id +
                ", location=" + location.toString() +
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