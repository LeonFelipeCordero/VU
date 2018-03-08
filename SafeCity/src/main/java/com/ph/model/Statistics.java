package com.ph.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import java.io.Serializable;

@JsonIgnoreProperties(ignoreUnknown = true)
public class Statistics implements Serializable {

    private static final long serialVersionUID = 1L;

    private String incident;
    private int count;

    public Statistics() {
    }

    public Statistics(String incident, int count) {
        this.incident = incident;
        this.count = count;
    }

    public String getIncident() {
        return incident;
    }

    public void setIncident(String incident) {
        this.incident = incident;
    }

    public int getCount() {
        return count;
    }

    public void setCount(int count) {
        this.count = count;
    }
}
