package com.ph.rest.template

import org.apache.tomcat.util.codec.binary.Base64
import org.springframework.http.HttpHeaders
import org.springframework.http.HttpRequest
import org.springframework.http.client.ClientHttpRequestExecution
import org.springframework.http.client.ClientHttpRequestInterceptor
import org.springframework.http.client.ClientHttpResponse

class BasicAuthInterceptor(private val username: String,
                           private val password: String) : ClientHttpRequestInterceptor {

    override fun intercept(httpRequest: HttpRequest, byteArray: ByteArray, clientHttpRequestExecution: ClientHttpRequestExecution): ClientHttpResponse {
        val headers = httpRequest.headers
        headers.add(HttpHeaders.AUTHORIZATION, encodeCredentialsForBasicAuth(username, password))
        return clientHttpRequestExecution.execute(httpRequest, byteArray)
    }

    private fun encodeCredentialsForBasicAuth(username: String, password: String): String {
        return "Basic ${Base64().encodeToString("$username:$password".toByteArray())}"
    }
}
