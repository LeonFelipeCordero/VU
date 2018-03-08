package com.ph.model;

public class DangerCount {

    private String level;
    private int total;

    public DangerCount(String level, int total) {
        this.level = level;
        this.total = total;
    }

    public DangerCount() {
    }

    public String getLevel() {
        return level;
    }

    public void setLevel(String level) {
        this.level = level;
    }

    public int getTotal() {
        return total;
    }

    public void setTotal(int total) {
        this.total = total;
    }
}
