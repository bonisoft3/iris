package com.trash.services.tracker

import com.google.cloud.NoCredentials
import com.google.cloud.storage.StorageOptions
import io.github.oshai.KotlinLogging
import io.micronaut.context.annotation.Requires
import io.micronaut.context.annotation.Value
import io.micronaut.context.event.BeanCreatedEvent
import io.micronaut.context.event.BeanCreatedEventListener
import io.micronaut.core.annotation.NonNull
import jakarta.inject.Singleton

// Route ObjectStorage Google Cloud Storage (gcs) requests to a local fake gcs cluster.
// Used for the preview environment.
@Singleton
@Requires(env=["k8s"])
class FakeGcsSetup(@Value("\${iris.fake-gcs-host}") val fakeGcsHost: String) : BeanCreatedEventListener<StorageOptions.Builder> {
  val logger = KotlinLogging.logger {}
  override fun onCreated(@NonNull event: BeanCreatedEvent<StorageOptions.Builder>): StorageOptions.Builder {
    logger.info("Setting up fake gcs host: $fakeGcsHost")
    return event.bean.setHost(fakeGcsHost)
      .setProjectId("test-project")
      .setCredentials(NoCredentials.getInstance())
  }
}
