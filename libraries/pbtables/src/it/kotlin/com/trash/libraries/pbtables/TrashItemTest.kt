package com.trash.libraries.pbtables


import app.cash.sqldelight.db.SqlDriver
import app.cash.sqldelight.driver.jdbc.asJdbcDriver
import com.google.protobuf.timestamp
import io.kotest.core.spec.style.FunSpec
import io.kotest.matchers.shouldBe
import jakarta.inject.Inject
import javax.sql.DataSource
import com.trash.libraries.pbtables.db.TrashItemQueries
import com.trash.tracker.v1.trashItem
import io.micronaut.test.extensions.kotest5.annotation.MicronautTest
import io.micronaut.data.connection.jdbc.advice.DelegatingDataSource
import java.util.UUID
import com.google.protobuf.util.JsonFormat
import com.trash.tracker.v1.TrashItem
import io.kotest.assertions.throwables.shouldThrow
import io.kotest.matchers.should
import io.kotest.matchers.string.contain
import org.postgresql.util.PSQLException
import java.time.Instant
import java.time.OffsetDateTime
import java.time.ZoneId

@MicronautTest
open class TrashItemTest(@field:Inject private val dataSource: DataSource): FunSpec({
  val jsonPrinter = JsonFormat.printer()
  val jsonParser = JsonFormat.parser()
  val unwrappedDataSource = (dataSource as DelegatingDataSource).targetDataSource
  val driver: SqlDriver = unwrappedDataSource.asJdbcDriver()
  val trashItemQueries = TrashItemQueries(driver)
  test("table exists and is empty") {
    val items = trashItemQueries.selectAll().executeAsList()
    items.size shouldBe 0
  }
  test("an item without key is not inserted") {
    val exception = shouldThrow<PSQLException> {
      trashItemQueries.insert(jsonPrinter.print(TrashItem.newBuilder()))
    }
    exception.message should contain("null")
  }
  test("an item can be inserted and searched for") {
    val uuid = UUID.randomUUID()
    val item = trashItem {
      id = uuid.toString()
      description = "trash item"
      userId = "123"
    }
    trashItemQueries.insert(jsonPrinter.print(item))

    val result = trashItemQueries.selectById(uuid).executeAsOne()
    val itemBuilder = TrashItem.newBuilder()
    jsonParser.merge(result.pbjson, itemBuilder)
    itemBuilder.id shouldBe item.id
    item.userId shouldBe "123"
  }
  test("the timestamp is properly copied from json into virtual column") {
    val uuid = UUID.randomUUID()
    val item = trashItem {
      id = uuid.toString()
      ts =  timestamp { seconds = 1 }
    }
    trashItemQueries.insert(jsonPrinter.print(item))
    val result = trashItemQueries.selectById(uuid).executeAsOne()
    result.ts shouldBe OffsetDateTime.ofInstant(Instant.EPOCH.plusSeconds(1), ZoneId.of("UTC"))
  }
})
