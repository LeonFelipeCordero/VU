package com.ph.model;

public class Statistics {

    private String incident;
    private int count;

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
