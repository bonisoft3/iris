package com.trash.services.tracker

import app.cash.sqldelight.driver.jdbc.asJdbcDriver
import com.fasterxml.uuid.Generators
import com.trash.libraries.pbtables.db.NewsItemQueries
import com.trash.tracker.v1.*
import io.github.oshai.KotlinLogging
import io.micronaut.data.connection.jdbc.advice.DelegatingDataSource
import jakarta.inject.Inject
import jakarta.inject.Singleton
import java.time.Instant
import java.time.LocalDateTime
import java.time.ZoneOffset
import java.util.*
import javax.sql.DataSource

@Singleton
class NewsEndpoint(@field:Inject private val dataSource: DataSource)
: NewsServiceGrpcKt.NewsServiceCoroutineImplBase() {
  private val driver = (dataSource as DelegatingDataSource).targetDataSource.asJdbcDriver()
  private val newsItemQueries = NewsItemQueries(driver)
  private val uuidGenerator = Generators.timeBasedGenerator()
  private val logger = KotlinLogging.logger {}

  override suspend fun manyNews(request: NewsRequest): NewsResponse {
    // Generate unique IDs for each news item
    val newsItemIds: List<UUID> = List<UUID>(request.newsList.size) { uuidGenerator.generate() }
    request.newsList.forEach {
      val epochSecond = Instant.now().epochSecond
      val savedOnTimestamp = LocalDateTime.ofEpochSecond(epochSecond, 0, ZoneOffset.UTC)
      val newsItemDate: LocalDateTime = LocalDateTime.ofInstant(
        Instant.ofEpochSecond(it.newsItemDate.seconds, it.newsItemDate.nanos.toLong()),
        ZoneOffset.UTC
      )
      newsItemQueries.insert(
        id = newsItemIds[request.newsList.indexOf(it)],
        savedOn = savedOnTimestamp,
        urlToImage = it.urlToImage,
        title = it.title,
        sourceName = it.sourceName,
        description = it.description,
        url = it.url,
        newsItemDate = newsItemDate,
      )
    }

    // Return the response with the generated news item IDs
    logger.info("Saved ${request.newsList.size} news")
    return newsResponse { ids += newsItemIds.map { it.toString() } }
  }
}
