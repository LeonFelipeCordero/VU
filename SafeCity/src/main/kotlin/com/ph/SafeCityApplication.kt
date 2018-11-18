package com.ph

import org.springframework.boot.SpringApplication
import org.springframework.boot.autoconfigure.SpringBootApplication

@SpringBootApplication
open class SafeCityApplication

fun main(args: Array<String>) {
    SpringApplication.run(SafeCityApplication::class.java, *args)
}
