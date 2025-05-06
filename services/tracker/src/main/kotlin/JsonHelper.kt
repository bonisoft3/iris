package com.trash.services.tracker

import io.micronaut.core.io.ResourceResolver
import org.apache.commons.io.IOUtils
import java.nio.charset.StandardCharsets

class JsonHelper {
  companion object {
    fun getJsonContentFromPath(jsonPath: String, fieldToReplace: String, parameter: String): String {
      val jsonStream = ResourceResolver().getResourceAsStream(jsonPath)

      return IOUtils.toString(jsonStream.get(), StandardCharsets.UTF_8).replace(fieldToReplace, parameter)
    }

    fun getJsonContentFromPath(jsonPath: String, replacements: Map<String, String>): String {
      val jsonStream = ResourceResolver().getResourceAsStream(jsonPath)
      var content = IOUtils.toString(jsonStream.get(), StandardCharsets.UTF_8)

      replacements.forEach { (key, value) ->
        content = content.replace(key, value)
      }

      return content
    }
  }
}