package com.ph;

import org.springframework.stereotype.Service;

/**
 * Created by leon on 18/06/17.
 */
@Service("customIncidentParser")
public class CustomIncidentParser {

//    public List<Incident> parse(String content) throws JSONException, ParseException {
//        List<Incident> incidents = new ArrayList<>();
//        JSONArray jsonArray = getSource(content);
//        for(int i=0;i<jsonArray.length();i++){
//            Map<String, Double> location = new HashMap<>();
//            JSONObject source = jsonArray.getJSONObject(i).getJSONObject("_source");
//            location.put("lat", source.getJSONObject("location").getDouble("lat"));
//            location.put("lon", source.getJSONObject("location").getDouble("lon"));
//            SimpleDateFormat format = new SimpleDateFormat("yyyy-mm-dd");
//            incidents.add(new Incident(
//                    location,
//                    source.getString("title"),
//                    source.getString("description"),
//                    source.getString("incident"),
//                    source.getInt("level"),
//                    format.parse(source.getString("date"))
//                    ));
//        }
//        return incidents;
//    }
//
//    private JSONArray getSource(String content) throws JSONException {
//        JSONObject jsonObject = new JSONObject(content);
//        return jsonObject.getJSONObject("hits").getJSONArray("hits");
//    }
}
