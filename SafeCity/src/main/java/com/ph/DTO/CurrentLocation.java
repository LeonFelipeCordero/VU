package com.ph.DTO;

/**
 * Created by 1a laptop 1 on 15/05/2017.
 */

public class CurrentLocation {
    private Double latitude;
    private Double longitude;

    public CurrentLocation() {
    }

    public CurrentLocation(Double latitude, Double longitude) {
        this.latitude = latitude;
        this.longitude = longitude;
    }

    public Double getLatitude() {
        return latitude;
    }

    public void setLatitude(Double latitude) {
        this.latitude = latitude;
    }

    public Double getLongitude() {
        return longitude;
    }

    public void setLongitude(Double longitude) {
        this.longitude = longitude;
    }
}
