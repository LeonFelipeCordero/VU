package com.ph.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import java.io.Serializable;
import java.util.List;

@JsonIgnoreProperties(ignoreUnknown = true)
public class StatsOnTime implements Serializable{

    private static final long serialVersionUID = 1L;

    private String timeAgo;
    private List<Statistics> statistics;

    public StatsOnTime() {
    }

    public StatsOnTime(String timeAgo, List<Statistics> statistics) {
        this.timeAgo = timeAgo;
        this.statistics = statistics;
    }

    public String getTimeAgo() {
        return timeAgo;
    }

    public void setTimeAgo(String timeAgo) {
        this.timeAgo = timeAgo;
    }

    public List<Statistics> getStatistics() {
        return statistics;
    }

    public void setStatistics(List<Statistics> statistics) {
        this.statistics = statistics;
    }
}
