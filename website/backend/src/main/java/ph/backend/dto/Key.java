package ph.backend.dto;

import java.io.Serializable;

public class Key implements Serializable {

    private static final long serialVersionUID = 1L;


    private String name;
    private String value;
    private String provider;
    private String description;

    public Key(String name, String value, String provider, String description) {
        this.name = name;
        this.value = value;
        this.provider = provider;
        this.description = description;
    }

    public Key() {
    }

    @Override
    public String toString() {
        return "Key{" +
                ", name='" + name + '\'' +
                ", value='" + value + '\'' +
                ", provider='" + provider + '\'' +
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

    public String getProvider() {
        return provider;
    }

    public void setProvider(String provider) {
        this.provider = provider;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }
}

