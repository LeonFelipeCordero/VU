package com.ph.service

import com.google.auth.oauth2.GoogleCredentials
import com.google.cloud.firestore.Firestore
import com.google.firebase.FirebaseApp
import com.google.firebase.FirebaseOptions
import com.google.firebase.cloud.FirestoreClient
import com.sun.xml.internal.fastinfoset.util.StringArray
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.beans.factory.annotation.Value
import org.springframework.context.annotation.Scope
import org.springframework.stereotype.Service
import java.io.FileInputStream
import java.security.MessageDigest
import java.time.LocalDateTime
import java.util.*
import javax.xml.bind.DatatypeConverter


@Service("fireBaseService")
@Scope(value = "singleton")
open class FireStoreServiceImpl : FireStoreService {

    @Value("\${environment}")
    private val environment: String? = null

    public lateinit var db: Firestore

    @Autowired
    fun FireStoreServiceImpl() {
        if (environment!! == "production") {
            this.db = productionConfig()!!
        } else {
            this.db = developConfig()!!
        }
    }

    private fun developConfig(): Firestore? {
        val serviceAccount = FileInputStream("C:\\Users\\core1\\workspace\\safecity-167102-firebase-adminsdk-0o9xi-11e168735c.json")
        val credentials = GoogleCredentials.fromStream(serviceAccount)
        val options = FirebaseOptions.Builder()
                .setCredentials(credentials)
                .build()
        FirebaseApp.initializeApp(options)

        return FirestoreClient.getFirestore()
    }

    private fun productionConfig(): Firestore? {
        val credentials = GoogleCredentials.getApplicationDefault()
        val options = FirebaseOptions.Builder()
                .setCredentials(credentials)
                .setProjectId("safecity-167102")
                .build()
        FirebaseApp.initializeApp(options)

        return FirestoreClient.getFirestore()
    }

    override fun generateDocument(): String? {
        val numbers = arrayOf("a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m", "n", "o", "p", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z")
        val random = Random()
        val num1 = random.nextInt(numbers.size - 0) + 0
        val num2 = random.nextInt(numbers.size - 0) + 0
        val current = LocalDateTime.now()
        val letters = numbers[num1] + numbers[num2]
        val string = "$num1$current$num2$letters"
        val md = MessageDigest.getInstance("MD5")
        md.update(string.toByteArray())
        val digest = md.digest()
        return DatatypeConverter.printHexBinary(digest).toUpperCase()
    }
}