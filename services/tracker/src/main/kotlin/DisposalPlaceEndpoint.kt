package com.trash.services.tracker

import app.cash.sqldelight.driver.jdbc.asJdbcDriver
import com.fasterxml.uuid.Generators
import com.google.protobuf.util.JsonFormat
import com.trash.libraries.pbtables.db.DisposalPlaceQueries
import com.trash.tracker.v1.*
import io.micronaut.data.connection.jdbc.advice.DelegatingDataSource
import jakarta.inject.Inject
import jakarta.inject.Singleton
import java.time.Instant
import java.time.LocalDateTime
import java.time.ZoneOffset
import javax.sql.DataSource

@Singleton
class DisposalPlaceEndpoint(@field:Inject private val dataSource: DataSource,
                            @field:Inject private val openAIClient: OpenAIClient,
) : DisposalPlaceServiceGrpcKt.DisposalPlaceServiceCoroutineImplBase() {
  private val driver = (dataSource as DelegatingDataSource).targetDataSource.asJdbcDriver()
  private val disposalPlaceQueries = DisposalPlaceQueries(driver)
  private val uuidGenerator = Generators.timeBasedGenerator()
  private val jsonPrinter = JsonFormat.printer()

  override suspend fun addDisposalPlace(request: DisposalPlaceRequest): DisposalPlaceResponse {
    val epochSecond = Instant.now().epochSecond
    val disposalPlaceId = uuidGenerator.generate()
    val savedOnTimestamp = LocalDateTime.ofEpochSecond(epochSecond, 0, ZoneOffset.UTC)
    val promptPath = "classpath:prompts/open_ai_classify_disposal_place.json"
    val replacements = mapOf("BASE64_IMAGE" to request.disposalPlace.imgUrl)
    val materialType = openAIClient.getChatCompletion(promptPath, replacements)

    disposalPlaceQueries.insert(
      disposalPlaceId,
      savedOnTimestamp,
      materialType,
      request.disposalPlace.userId,
      request.disposalPlace.imgUrl,
      jsonPrinter.print(request.disposalPlace.latlng.toBuilder())
    )
    return disposalPlaceResponse { id = disposalPlaceId.toString() }
  }
}
