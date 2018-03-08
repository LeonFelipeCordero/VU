package com.ph.dto

data class TimeIncidentCount constructor(val timeAgo: String, val statistics: MutableList<IncidentCount>)