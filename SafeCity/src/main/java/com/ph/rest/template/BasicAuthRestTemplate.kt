package com.ph.rest.template

import org.springframework.http.client.ClientHttpRequestInterceptor
import org.springframework.http.client.InterceptingClientHttpRequestFactory
import org.springframework.web.client.RestTemplate

class BasicAuthRestTemplate : RestTemplate() {

    private val username: String = "SafeCity"
    private val password: String = "SafeCity"

    init {
        if (username.isEmpty()) {
            throw RuntimeException("Username is mandatory for Basic Auth")
        }

        val interceptors = listOf<ClientHttpRequestInterceptor>(BasicAuthInterceptor(username, password))
        requestFactory = InterceptingClientHttpRequestFactory(requestFactory, interceptors)
    }
}
