package com.ph.model;

import java.io.Serializable;

public class Key implements Serializable {

    private static final long serialVersionUID = 1L;


    private String name;
    private String value;
    private String privider;
    private String description;

    public Key(String name, String value, String privider, String description) {
        this.name = name;
        this.value = value;
        this.privider = privider;
        this.description = description;
    }

    public Key() {
    }

    @Override
    public String toString() {
        return "Key{" +
                ", name='" + name + '\'' +
                ", value='" + value + '\'' +
                ", privider='" + privider + '\'' +
                ", description='" + description + '\'' +
                '}';
    }

    public static long getSerialVersionUID() {
        return serialVersionUID;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getValue() {
        return value;
    }

    public void setValue(String value) {
        this.value = value;
    }

    public String getPrivider() {
        return privider;
    }

    public void setPrivider(String privider) {
        this.privider = privider;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }
}
