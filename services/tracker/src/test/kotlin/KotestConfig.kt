package com.trash.services.tracker

import io.kotest.core.config.AbstractProjectConfig
import io.kotest.extensions.htmlreporter.HtmlReporter
import io.kotest.extensions.junitxml.JunitXmlReporter
import io.micronaut.test.extensions.kotest5.MicronautKotest5Extension

@Suppress("unused")
object KotestConfig : AbstractProjectConfig() {
  override fun extensions() = listOf(
    MicronautKotest5Extension,
    JunitXmlReporter(
      includeContainers = false,
      useTestPathAsName = true,
      outputDir = "test-results/kotest"
    ),
    HtmlReporter()
  )
}
