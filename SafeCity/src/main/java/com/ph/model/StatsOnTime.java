package com.ph.model;

import java.util.List;

public class StatsOnTime {

    private String timeAgo;
    private List<Statistics> statistics;

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
