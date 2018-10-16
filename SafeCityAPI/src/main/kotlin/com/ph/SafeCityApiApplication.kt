package com.ph

import org.springframework.boot.SpringApplication
import org.springframework.boot.autoconfigure.SpringBootApplication
import org.springframework.scheduling.annotation.EnableAsync

@EnableAsync
@SpringBootApplication
open class SafeCityApiApplication
fun main(args: Array<String>) {
    SpringApplication.run(SafeCityApiApplication::class.java, *args)
}

