package com.trash.services.tracker

import io.grpc.protobuf.services.ProtoReflectionService
import io.micronaut.runtime.Micronaut.build
import io.github.oshai.KotlinLogging

fun main(vararg args: String) {
  val logger = KotlinLogging.logger {}
  logger.info("Davi is here")
  build()
    .args(*args)
    .packages("com.trash.services.tracker")
    .singletons(ProtoReflectionService.newInstance())
    .start()
}
