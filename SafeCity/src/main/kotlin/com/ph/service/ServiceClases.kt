import com.ph.model.Incident
import com.ph.model.StatsOnTime

class IncidentsList : MutableList<Incident> by ArrayList()

class StatsOnTimeList : MutableList<StatsOnTime> by ArrayList()
