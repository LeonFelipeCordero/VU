package com.ph.form;

import javax.validation.constraints.NotNull;
import java.io.Serializable;

/**
 * Created by leon on 20/05/2017.
 */
public class IncidentForm implements Serializable {

    private static final long serialVersionUID = 1L;

    @NotNull
    private String lat;

    @NotNull
    private String lng;

    @NotNull
    private String title;

    @NotNull
    private String description;

    @NotNull
    private String incident;

    @NotNull
    private String date;

    public IncidentForm(String lat, String lng, String title, String description, String incident, String date) {
        this.lat = lat;
        this.lng = lng;
        this.title = title;
        this.description = description;
        this.incident = incident;
        this.date = date;
    }

    public IncidentForm(String lat, String lng) {
        this.lat = lat;
        this.lng = lng;
    }

    public IncidentForm() {
    }

    public String getLat() {
        return lat;
    }

    public void setLat(String lat) {
        this.lat = lat;
    }

    public String getLng() {
        return lng;
    }

    public void setLng(String lng) {
        this.lng = lng;
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

    public String getDate() {
        return date;
    }

    public void setDate(String date) {
        this.date = date;
    }
}
