//package com.ph.json
//
//import kotlinx.serialization.KInput
//import kotlinx.serialization.KOutput
//import kotlinx.serialization.KSerializer
//import kotlinx.serialization.Serializer
//import kotlinx.serialization.internal.SerialClassDescImpl
//import org.springframework.data.mongodb.core.geo.GeoJsonPoint
//
//@Serializer(forClass = GeoJsonPoint::class)
//class GeoJsonDeserialize : KSerializer<GeoJsonPoint>{
//    override val serialClassDesc: kotlinx.serialization.KSerialClassDesc = SerialClassDescImpl("location")
//    private val GEOJSON_TYPE_POINT = "Point"
//    private val JSON_KEY_GEOJSON_TYPE = "type"
//    private val JSON_KEY_GEOJSON_COORDS = "coordinates"
//
//    override fun load(input: KInput): GeoJsonPoint {
//        input.read<String>()
//        Parser
////        val tree = input.readTree(input)
////        input.readStringValue()
////        val type = input.read(JSON_KEY_GEOJSON_TYPE)
////        val coordsNode = tree.get(JSON_KEY_GEOJSON_COORDS)
////
////        var x = 0.0
////        var y = 0.0
////        if (GEOJSON_TYPE_POINT.equals(type, ignoreCase = true)) {
////            x = coordsNode.get(0).asDouble()
////            y = coordsNode.get(1).asDouble()
////        } else {
////            println(String.format("No logic present to deserialize %s ", tree.asText()))
////        }
////
////        return GeoJsonPoint(x, y)
//        return GeoJsonPoint(123.toDouble(), 123.toDouble())
//    }
//
//    override fun save(output: KOutput, obj: GeoJsonPoint) {
//        TODO("not implemented") //To change body of created functions use File | Settings | File Templates.
//    }
//}
