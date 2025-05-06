package com.trash.services.tracker

import com.trash.tracker.v1.*
import jakarta.inject.Inject
import jakarta.inject.Singleton

@Singleton
class ObjectMaterialEndpoint(
  @field:Inject private val openAIClient: OpenAIClient
): ObjectMaterialServiceGrpcKt.ObjectMaterialServiceCoroutineImplBase() {

  override suspend fun objectMaterial(request: ObjectMaterialRequest): ObjectMaterialResponse {
    val promptPath = "classpath:prompts/open_ai_material_object.json"
    val replacements = mapOf(
      "BASE64_IMAGE" to request.picture,
      "LANGUAGE" to "english"
    )
    val material = openAIClient.getChatCompletion(promptPath, replacements)
    return objectMaterialResponse { objectMaterial = material}
  }
}
