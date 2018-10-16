package com.ph.config

import org.springframework.boot.context.properties.ConfigurationProperties
import org.springframework.stereotype.Component

@Component
@ConfigurationProperties(prefix = "api")
class PropertiesConfiguration {

    var host: String? = null
}
