package com.ph.service;

import com.ph.dao.IncidentDao;
import com.ph.form.IncidentForm;
import com.ph.model.Incident;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.mongodb.core.geo.GeoJsonPoint;
import org.springframework.stereotype.Service;

import java.text.DateFormat;
import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.List;

/**
 * Created by leon on 25/05/2017.
 */
@Service("incidentService")
public class IncidentServiceImpl implements IncidentService {

    @Autowired
    private IncidentDao incidentDao;

    public Incident convertFormToIncident(IncidentForm incidentForm) {
        return new Incident(
                new GeoJsonPoint(Double.parseDouble(incidentForm.getLng()), Double.parseDouble(incidentForm.getLat())),
                incidentForm.getTitle(),
                incidentForm.getDescription(),
                incidentForm.getIncident(),
                getIncidentLevel(incidentForm.getIncident()),
                getDateFormat(incidentForm.getDate())
        );
    }

    @Override
    public List<Incident> findNearIncidents(double lat, double lng) {
        return incidentDao.getNearIncidents(lat, lng);
    }

    @Override
    public void save(Incident incident) {
        incidentDao.save(incident);
    }

    private int getIncidentLevel(String incident) {
        switch (incident) {
            case "Fight":
                return 1;
            case "Big Fight":
                return 2;
            case "Theft":
                return 3;
            case "Establishment Theft":
                return 4;
            case "House Theft":
                return 5;
            case "Shooting":
                return 6;
            case "Murder":
                return 7;
            case "Drugs":
                return 8;
            case "Police Arrest":
                return 5;
            case "kidnapping":
                return 5;
            default:
                return 3;
        }

    }

    private Date getDateFormat(String date) {
        DateFormat format = new SimpleDateFormat("yyyy-MM-dd'T'HH:mm");
        try {
            return format.parse(date);
        } catch (ParseException e) {
            e.printStackTrace();
        }
        return new Date();
    }

}
