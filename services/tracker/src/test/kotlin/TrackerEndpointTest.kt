package com.trash.services.tracker

import io.kotest.core.spec.style.BehaviorSpec
import io.micronaut.data.connection.jdbc.advice.DelegatingDataSource
import io.micronaut.objectstorage.ObjectStorageOperations
import io.mockk.mockk
import com.trash.tracker.v1.trackRequest
import io.kotest.extensions.mockserver.MockServerListener
import io.kotest.matchers.shouldNotBe
import io.mockk.coEvery
import java.net.URI
import org.mockserver.client.MockServerClient
import org.mockserver.model.Header
import org.mockserver.model.HttpRequest
import org.mockserver.model.HttpResponse
import java.net.ServerSocket

fun findRandomOpenPort(): Int {
    ServerSocket(0).use { socket -> return socket.localPort }
}

class TrackerEndpointTest : BehaviorSpec({
    val mockserverUrl = "http://localhost:${findRandomOpenPort()}/"
    val mockserverURI = URI(mockserverUrl)
    val msl = MockServerListener(mockserverURI.port)
    listener(msl)

    beforeTest {
        assert("localhost" == mockserverURI.host)
        assert(msl.mockServer?.port == mockserverURI.port)
        val msc = MockServerClient(mockserverURI.host, mockserverURI.port)

        // Mock do endpoint de chat
        msc.`when`(
            HttpRequest.request()
                .withMethod("GET")
                .withPath("/api/chat")
        ).respond(
            HttpResponse.response()
                .withStatusCode(200)
                .withHeaders(Header("Content-Type", "application/json"))
                .withBody("""{"choices":[{"index":0,"message":{"role":"assistant","content":"HELLO WORLD"}}]}""")
        )

        // Mock do endpoint de tradução
        msc.`when`(
            HttpRequest.request()
                .withMethod("POST")
                .withPath("/language/translate/v2")
        ).respond(
            HttpResponse.response()
                .withStatusCode(200)
                .withHeaders(Header("Content-Type", "application/json"))
                .withBody("""{"data":{"translations":[{"translatedText":"Hello World"}]}}""")
        )
    }

    val dataSource = mockk<DelegatingDataSource>(relaxed = true)
    val objectStorage = mockk<ObjectStorageOperations<*, *, *>>(relaxed = true)
    val googleVertexPalmAPI = mockk<GoogleVertexPalmAPI>(relaxed = true)
    val openAIClient = mockk<OpenAIClient>(relaxed = true)
    coEvery { googleVertexPalmAPI.reqPalm(any(), any(), any()) } returns GoogleVertexPalmResponse(
        listOf(VertexPredictions(listOf(PalmCandidate("content", "author")), "", "")), ""
    )
    val cloudComputeTokenInterface = mockk<CloudComputeTokenInterface>(relaxed = true)
    val geminiClient = mockk<GeminiClient>(relaxed = true)
    val chatCompletionClientFactory = mockk<ChatCompletionClientFactory>(relaxed = true)

    given("a tracking request") {
        val trackerEndpoint = TrackerEndpoint(
            dataSource, objectStorage, googleVertexPalmAPI, cloudComputeTokenInterface, 
            geminiClient, openAIClient, chatCompletionClientFactory,
            "fakeStorageUrl",
            "fakePlacesKey", mockserverUrl,
            "fakeAnnotateEndpoint",
            mockserverUrl, "language/translate/v2", mockserverUrl, "classpath:prompts/ollama_"
        )
        val request = trackRequest { }

        `when`("track is called") {
            val response = trackerEndpoint.track(request)

            then("response should have a valid id") {
                response.id.length shouldNotBe 0
            }
        }
    }
})
