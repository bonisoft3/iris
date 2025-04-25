package com.trash.libraries.logs

import io.kotest.core.spec.style.FunSpec
import org.logcapture.assertion.ExpectedLoggingMessage.aLog
import org.logcapture.kotest.LogCaptureListener
import org.slf4j.LoggerFactory


class LogsTest(): FunSpec({
  val logCaptureListener = LogCaptureListener()
  listener(logCaptureListener)  // Add LogCaptureListener

  val log = LoggerFactory.getLogger(LogsTest::class.java)

  test("log a simple line") {
    log.info("a message")
    logCaptureListener.logged(aLog().info().withMessage("a message"))
  }
})
