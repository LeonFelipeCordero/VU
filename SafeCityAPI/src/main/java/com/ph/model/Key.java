package com.ph.model;

import org.bson.types.ObjectId;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.io.Serializable;

@Document(collection = "keys")
public class Key implements Serializable {

    private static final long serialVersionUID = 1L;

    @Id
    private ObjectId _id;

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
                "_id=" + _id +
                ", name='" + name + '\'' +
                ", value='" + value + '\'' +
                ", privider='" + privider + '\'' +
                ", description='" + description + '\'' +
                '}';
    }

    public static long getSerialVersionUID() {
        return serialVersionUID;
    }

    public ObjectId get_id() {
        return _id;
    }

    public void set_id(ObjectId _id) {
        this._id = _id;
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
