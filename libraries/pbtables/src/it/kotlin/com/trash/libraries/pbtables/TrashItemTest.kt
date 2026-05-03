package com.trash.libraries.pbtables


import app.cash.sqldelight.db.SqlDriver
import app.cash.sqldelight.driver.jdbc.asJdbcDriver
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
  test("duplicate ids are rejected") {
    val uuid = UUID.randomUUID()
    trashItemQueries.insert(uuid, jsonPrinter.print(trashItem { id = uuid.toString() }))
    val exception = shouldThrow<PSQLException> {
      trashItemQueries.insert(uuid, jsonPrinter.print(trashItem { id = uuid.toString() }))
    }
    exception.message should contain("duplicate key")
  }
  test("an item can be inserted and searched for") {
    val uuid = UUID.randomUUID()
    val item = trashItem {
      id = uuid.toString()
      description = "trash item"
      userId = "123"
    }
    trashItemQueries.insert(uuid, jsonPrinter.print(item))

    val result = trashItemQueries.selectById(uuid).executeAsOne()
    val itemBuilder = TrashItem.newBuilder()
    jsonParser.merge(result.pbjson, itemBuilder)
    itemBuilder.id shouldBe item.id
    item.userId shouldBe "123"
  }
})
