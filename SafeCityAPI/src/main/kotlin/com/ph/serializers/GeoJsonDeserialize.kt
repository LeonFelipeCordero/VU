package com.ph.serializers

import kotlinx.serialization.KInput
import kotlinx.serialization.KOutput
import kotlinx.serialization.KSerializer
import kotlinx.serialization.Serializer
import kotlinx.serialization.internal.SerialClassDescImpl
import org.springframework.data.mongodb.core.geo.GeoJsonPoint

@Serializer(forClass = GeoJsonPoint::class)
class GeoJsonDeserialize : KSerializer<GeoJsonPoint> {
    override val serialClassDesc: kotlinx.serialization.KSerialClassDesc = SerialClassDescImpl("GeoJsonPoint")

    override fun load(input: KInput): GeoJsonPoint {
        TODO("not implemented")
    }

    override fun save(output: KOutput, obj: GeoJsonPoint) = output.writeStringValue(obj.toJson())

}

fun GeoJsonPoint.toJson(): String = "{type: '${this.type}', coordinates: [${this.x}, ${this.y}]}"
