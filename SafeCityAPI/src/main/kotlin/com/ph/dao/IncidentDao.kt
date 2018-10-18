package com.ph.dao

import com.ph.model.Danger
import com.ph.model.IncidentCount
import com.ph.model.TimeIncidentCount
import com.ph.model.Incident
import org.springframework.data.geo.Distance
import org.springframework.data.geo.Point
import org.springframework.data.mongodb.core.MongoOperations
import org.springframework.data.mongodb.core.aggregation.Aggregation
import org.springframework.data.mongodb.core.query.Criteria
import org.springframework.data.mongodb.core.query.NearQuery
import org.springframework.data.mongodb.core.query.Query
import org.springframework.stereotype.Service
import java.util.*

@Service
open class IncidentDao(private val mongoOperations: MongoOperations) {

    fun getStatistics(lat: Double, lng: Double): MutableList<TimeIncidentCount> {
        val sixMonthsCalendar = Calendar.getInstance()
        val oneYearCalendar = Calendar.getInstance()
        val twoYearsCalendar = Calendar.getInstance()
        sixMonthsCalendar.add(Calendar.MONTH, -6)
        oneYearCalendar.add(Calendar.MONTH, -12)
        twoYearsCalendar.add(Calendar.MONTH, -24)
        return mutableListOf(
                TimeIncidentCount("six months",
                        mongoOperations.aggregate(
                                getNearAggregationStatsByDate(lat, lng, sixMonthsCalendar),
                                Incident::class.java,
                                IncidentCount::class.java).mappedResults),
                TimeIncidentCount("one year",
                        mongoOperations.aggregate(
                                getNearAggregationStatsByDate(lat, lng, oneYearCalendar),
                                Incident::class.java,
                                IncidentCount::class.java).mappedResults),
                TimeIncidentCount("two years",
                        mongoOperations.aggregate(
                                getNearAggregationStatsByDate(lat, lng, twoYearsCalendar),
                                Incident::class.java,
                                IncidentCount::class.java).mappedResults))
    }

    fun getDangerCount(lat: Double, lng: Double): Danger {
        val calendar = Calendar.getInstance()
        calendar.add(Calendar.MONTH, -6)
        return mongoOperations.aggregate(
                getDangerCountByDate(lat, lng, calendar),
                Incident::class.java,
                Danger::class.java).uniqueMappedResult
    }

    private fun getNearAggregationStatsByDate(lat: Double, lng: Double, calendar: Calendar): Aggregation =
            Aggregation.newAggregation(
                    Aggregation.geoNear(NearQuery.near(Point(lng, lat)).maxDistance(Distance(10.0)).spherical(true).inKilometers(), "distance"),
                    Aggregation.match(Criteria.where("date").lte(Date()).gte(calendar.time)),
                    Aggregation.group("incident").count().`as`("count"),
                    Aggregation.project("count").and("incident").previousOperation())


    private fun getDangerCountByDate(lat: Double, lng: Double, calendar: Calendar): Aggregation =
            Aggregation.newAggregation(
                    Aggregation.geoNear(NearQuery.near(Point(lng, lat)).maxDistance(Distance(10.0)).spherical(true).inKilometers(), "distance"),
                    Aggregation.match(Criteria.where("date").lte(Date()).gte(calendar.time)),
                    Aggregation.group().sum("level").`as`("total"))


}
