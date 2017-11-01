package com.ph.dao;

import com.ph.model.Key;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.mongodb.core.MongoOperations;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.stereotype.Repository;


/**
 * Created by leon on 24/05/2017.
 */
@Repository("keyDao")
public class KeyDaoImpl implements KeyDao{

    @Autowired
    private MongoOperations mongoOperations;

    @Override
    public Key getGoogleMapsApiKey() {
        Query searchQuery = new Query(Criteria.where("name").is("google.api"));
        searchQuery.limit(1);
        return mongoOperations.findOne(searchQuery, Key.class);
    }



}

