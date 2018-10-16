package com.ph

import org.springframework.boot.SpringApplication
import org.springframework.boot.autoconfigure.SpringBootApplication
import org.springframework.scheduling.annotation.EnableAsync

@SpringBootApplication
@EnableAsync(proxyTargetClass = true)
open class SafeCityApplication

fun main(args: Array<String>) {
    SpringApplication.run(SafeCityApplication::class.java, *args)
}
