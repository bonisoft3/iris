package com.trash.libraries.pbtables

import app.cash.sqldelight.db.SqlDriver
import app.cash.sqldelight.driver.jdbc.asJdbcDriver
import com.google.protobuf.util.JsonFormat
import com.trash.libraries.pbtables.db.DonatesQueries
import jakarta.inject.Inject
import jakarta.inject.Singleton
import javax.sql.DataSource
import io.micronaut.data.connection.jdbc.advice.DelegatingDataSource;

@Singleton
class Donates (
  @field:Inject private val dataSource: DataSource
)
{
  private val jsonPrinter = JsonFormat.printer()
  private val jsonParser = JsonFormat.parser()
  private val unwrappedDataSource = (dataSource as DelegatingDataSource).targetDataSource
  private val driver: SqlDriver = unwrappedDataSource.asJdbcDriver()
  val DonatesQueries = DonatesQueries(driver)
}
