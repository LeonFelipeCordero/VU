package com.ph.serializers

import kotlinx.serialization.*
import kotlinx.serialization.internal.SerialClassDescImpl
import java.text.SimpleDateFormat
import java.util.*

@Serializer(forClass = Date::class)
class DateSerializer : KSerializer<Date> {
    override val serialClassDesc: kotlinx.serialization.KSerialClassDesc = SerialClassDescImpl("Date")

    private val df = SimpleDateFormat("dd/MM/yyyy'T'HH:mm:ss.SSS", Locale.getDefault())

    override fun load(input: KInput): Date = df.parse(input.readStringValue())

    override fun save(output: KOutput, obj: Date) = output.writeStringValue(df.format(obj))
}
