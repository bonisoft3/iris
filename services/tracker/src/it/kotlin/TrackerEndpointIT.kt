package com.trash.services.tracker

import app.cash.sqldelight.driver.jdbc.asJdbcDriver
import com.google.protobuf.util.JsonFormat
import com.trash.libraries.pbtables.db.TrashItemQueries
import com.trash.tracker.v1.TrackRequest
import com.trash.tracker.v1.TrackerServiceGrpcKt
import com.trash.tracker.v1.TrashItem
import io.grpc.ManagedChannel
import io.kotest.core.spec.style.BehaviorSpec
import io.kotest.extensions.mockserver.MockServerListener
import io.kotest.matchers.shouldBe
import io.kotest.matchers.shouldNotBe
import io.micronaut.context.annotation.Factory
import io.micronaut.context.annotation.Property
import io.micronaut.context.annotation.Value
import io.micronaut.data.connection.jdbc.advice.DelegatingDataSource
import io.micronaut.grpc.annotation.GrpcChannel
import io.micronaut.test.extensions.kotest5.annotation.MicronautTest
import jakarta.inject.Inject
import jakarta.inject.Singleton
import org.mockserver.client.MockServerClient
import org.mockserver.model.Header
import org.mockserver.model.HttpRequest
import org.mockserver.model.HttpResponse
import java.net.URI
import java.nio.charset.StandardCharsets
import java.nio.file.Files
import java.nio.file.Paths
import java.util.*
import javax.sql.DataSource

@Factory
internal class Clients {
  @Singleton
  fun reactiveStub(
    @GrpcChannel("tracker") channel: ManagedChannel): TrackerServiceGrpcKt.TrackerServiceCoroutineStub {
    return TrackerServiceGrpcKt.TrackerServiceCoroutineStub(channel)
  }
}

@MicronautTest
@Property(name = "iris.google-api-url", value = "http://localhost:\${random.port}")
@Property(name = "iris.google-vision-api-url", value = "\${iris.google-api-url}")
@Property(name = "iris.cloud-compute-metadata-url", value = "\${iris.google-api-url}/computeMetadata")
@Property(name = "iris.google-translation-url", value = "\${iris.google-api-url}")
@Property(name = "openai.api.url", value = "\${iris.google-api-url}")
@Property(name = "iris.google-maps-api-url", value = "\${iris.google-api-url}")
class TrackerEndpointIT(
  @field:Inject private val dataSource: DataSource,
  @field:Inject private val trackerService: TrackerServiceGrpcKt.TrackerServiceCoroutineStub,
  @field:Inject @Value("\${iris.storage-url}") private val urlPrefix: String,
  @field:Inject @Value("\${iris.google-api-url}") private val googleApiUrl: String,
) : BehaviorSpec({
  val googleApiURI = URI(googleApiUrl)
  val msl = MockServerListener(googleApiURI.port)
  listener(msl)
  beforeTest {
    assert("localhost" == googleApiURI.host)
    assert(msl.mockServer?.port == googleApiURI.port)
    val msc = MockServerClient(googleApiURI.host, googleApiURI.port)
    msc
      .`when`(HttpRequest.request()
        .withMethod("GET")
        .withPath("/computeMetadata/v1/instance/service-accounts/default/token"))
      .respond(HttpResponse.response()
        .withStatusCode(200)
        .withHeaders(Header("Content-Type", "application/json") )
        .withBody("""{ "access_token": "mocked_access_token", "expires_in": 3600, "token_type": "Bearer" }"""))
    msc
      .`when`(HttpRequest.request()
        .withMethod("POST")
        .withPath( "/v1/projects/trash-362115/locations/us-central1/publishers/google/models/imagetext:predict"))
      .respond(HttpResponse.response()
        .withStatusCode(200)
        .withHeaders(Header("Content-Type", "application/json") )
        .withBody("""{ "deployedModelId": "modelId", "predictions": ["cardboard box"] }"""))
    msc
      .`when`(HttpRequest.request()
        .withMethod("POST")
        .withPath( "/v1/projects/trash-362115/locations/us-central1/publishers/google/models/chat-bison:predict"))
      .respond(HttpResponse.response()
        .withStatusCode(200)
        .withHeaders(Header("Content-Type", "application/json") )
        .withBody("""{ "metadata": {}, "predictions": [{ "safetyAttributes": {}, "citationMetadata": {}, "candidates": [{  "author": "me", "content": "the content"  }] }] }"""))
    msc
      .`when`(HttpRequest.request()
        .withMethod("POST")
        .withPath("/v1/images:annotate"))
      .respond(HttpResponse.response()
        .withStatusCode(200)
        .withHeaders(Header("Content-Type", "application/json") )
        .withBody("""{ "responses": [{"safeSearchAnnotation": {"adult": "VERY_UNLIKELY", "spoof": "VERY_UNLIKELY", "medical": "VERY_UNLIKELY", "violence": "LIKELY", "racy": "VERY_UNLIKELY"}}] }"""))
    msc
      .`when`(HttpRequest.request()
        .withMethod("POST")
        .withPath("/language/translate/v2"))
      .respond(HttpResponse.response()
        .withStatusCode(200)
        .withHeaders(Header("Content-Type", "application/json") )
        .withBody("""{"data":{"translations":[{"translatedText":"caixa de papelão"}]}}"""))
    msc
      .`when`(HttpRequest.request()
        .withMethod("POST")
        .withPath("/api/chat"))
      .respond(HttpResponse.response()
        .withStatusCode(200)
        .withHeaders(Header("Content-Type", "application/json"))
        .withBody("""{ "message": {"role": "assistant", "content": "0" }}"""))
  }
  val driver = (dataSource as DelegatingDataSource).targetDataSource.asJdbcDriver()
  val trashItemQueries = TrashItemQueries(driver)
  val parser = JsonFormat.parser()
  given("the tracker endpoint") {
    `when`("the endpoint is called with 123") {
      val path = Paths.get("").toAbsolutePath().toString()
      val picture = Files.readString(Paths.get("$path/src/test/resources/bottle_test.txt"))
      val request = TrackRequest.newBuilder().setItem(TrashItem.newBuilder().setDescription("123").setPicture(picture).setUserId("1").setUserLanguage("pt").setUserCity("sao paulo")).build()
      val result = trackerService.track(request)
      then("the result has a uuid") {
        UUID.fromString(result.id) shouldNotBe null
      }
      then("the json is in the database") {
        val row = trashItemQueries.selectById(UUID.fromString(result.id)).executeAsOne()
        val builder = TrashItem.newBuilder()
        parser.merge(row.pbjson, builder)
        val item = builder.build()
        item.picture shouldBe "${urlPrefix}${item.id}.jpg"
        assert(item.caption is String)
        item.userId shouldBe "1"
        item.taggedAsInnapropriate shouldBe true
        item.userCity shouldBe "sao paulo"
      }
    }
  }
})
