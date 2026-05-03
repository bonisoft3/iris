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
// jdk25 verify: 1777209910
// jdk25 retry: 1777210061
// jdk25 retry 2: 1777210151
// AppCDS jdk25 attempt: 1777210518
// post-AppCDS revert: 1777210619
