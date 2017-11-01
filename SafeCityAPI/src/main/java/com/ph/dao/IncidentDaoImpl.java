package com.ph.dao;

import com.ph.model.Incident;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.geo.Point;
import org.springframework.data.mongodb.core.MongoOperations;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Created by leon on 25/05/2017.
 */
@Repository("incidentDao")
public class IncidentDaoImpl implements IncidentDao{

    @Autowired
    private MongoOperations mongoOperations;

    @Override
    public void save(Incident incident) {
        mongoOperations.save(incident);
    }

    @Override
    public List<Incident> getNearIncidents(double lat, double lng){
        return mongoOperations.find(
                new Query(
                        Criteria.where("location").nearSphere(new Point(lng, lat)).maxDistance(0.0001)),
                Incident.class);
    }

    @Override
    public void delete(Incident incident) {
        mongoOperations.remove(incident);
    }
}
