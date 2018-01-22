package com.ph.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import com.google.cloud.firestore.GeoPoint;
import com.ph.json.GeoJsonDeserialize;

import java.io.Serializable;
import java.util.Date;

/**
 * Created by leon on 25/05/2017.
 */
//@Document(collection = "incident")
//@CompoundIndexes({
//        @CompoundIndex(name = "geolocation", def = "{'location': '2dsphere'}")
//})
@JsonIgnoreProperties(ignoreUnknown = true)
public class Incident implements Serializable{

    private static final long serialVersionUID = 1L;

    private String _id;
    @JsonDeserialize(using = GeoJsonDeserialize.class)
    private GeoPoint location;
    private String title;
    private String description;
    private String incident;
    private Date date;
    private int level;

    public Incident(String _id, GeoPoint location, String title, String description, String incident, Date date, int level) {
        this._id = _id;
        this.location = location;
        this.title = title;
        this.description = description;
        this.incident = incident;
        this.date = date;
        this.level = level;
    }

    public Incident(GeoPoint location, String title, String description, String incident, int level, Date date) {
        this.location = location;
        this.title = title;
        this.description = description;
        this.incident = incident;
        this.level = level;
        this.date = date;
    }

    public Incident() {
    }

    @Override
    public String toString() {
        return "Incident{" +
                ", location=" + location.toString() +
                ", title='" + title + '\'' +
                ", description='" + description + '\'' +
                ", incident='" + incident + '\'' +
                ", date=" + date +
                ", level=" + level +
                '}';
    }

    public String get_id() {
        return _id;
    }

    public void set_id(String _id) {
        this._id = _id;
    }

    public GeoPoint getLocation() {
        return location;
    }

    public void setLocation(GeoPoint location) {
        this.location = location;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getIncident() {
        return incident;
    }

    public void setIncident(String incident) {
        this.incident = incident;
    }

    public Date getDate() {
        return date;
    }

    public void setDate(Date date) {
        this.date = date;
    }

    public int getLevel() {
        return level;
    }

    public void setLevel(int level) {
        this.level = level;
    }
}
