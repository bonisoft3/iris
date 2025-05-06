package com.trash.services.tracker

import io.github.oshai.KotlinLogging
import io.micronaut.context.annotation.Value
import jakarta.inject.Inject
import jakarta.inject.Singleton
import kotlinx.serialization.Serializable
import kotlinx.serialization.json.Json
import kotlinx.serialization.json.jsonArray
import kotlinx.serialization.json.jsonObject
import kotlinx.serialization.json.jsonPrimitive
import okhttp3.MediaType.Companion.toMediaType
import okhttp3.OkHttpClient
import okhttp3.Request
import okhttp3.RequestBody.Companion.toRequestBody
import java.util.concurrent.TimeUnit;

@Serializable
data class OpenAiResponse(val choices: List<Choices>? = null)

@Singleton
class OpenAIClient(@field:Inject @Value("\${openai.api.url}") private val openAiApiUrl: String,
                   @field:Inject @Value("\${openai.endpoint.chat-completions}") private val chatCompletionEndpoint: String,
                   @field:Inject @Value("\${openai.api.key}") private val apiKey: String,
                   @field:Inject @Value("\${prompt-path-prefix}") private val promptPathPrefix: String
				   ) : ChatCompletionClient {
  private val client: OkHttpClient = OkHttpClient.Builder().readTimeout(600, TimeUnit.SECONDS).build()
  private val json = Json {
    ignoreUnknownKeys = true
    explicitNulls = false
  }
	private val logger = KotlinLogging.logger {}

	
	override fun getChatCompletion(promptPath: String, promptReplacements: Map<String, String>): String {
	val openaiPromptPathPrefix = "classpath:prompts/open_ai_"
    val mediaType = "application/json".toMediaType()
	val fullPromptPath = "$openaiPromptPathPrefix$promptPath"
    val jsonContent = JsonHelper.getJsonContentFromPath(fullPromptPath, promptReplacements).trimIndent()
    val body = jsonContent.toRequestBody(mediaType)
    val gptRequest = Request.Builder()
			.url("$openAiApiUrl$chatCompletionEndpoint")
			.post(body)
			.addHeader("Authorization", "Bearer ${apiKey.trim()}")
			.build()

		logger.info("Issuing request to ${gptRequest.url}")
    client.newCall(gptRequest).execute().use { gptResponse ->
      if (!gptResponse.isSuccessful) {
				throw RuntimeException(
					"Failed to get response from ${gptRequest.url}: ${gptResponse.code} ${gptResponse.message}")
			}
			val responseBody = gptResponse.body!!.string()
			val jsonObject = json.parseToJsonElement(responseBody).jsonObject
			val msg = if (promptPathPrefix == "classpath:prompts/ollama_") {
				jsonObject["message"]?.jsonObject?.get("content")?.jsonPrimitive?.content
			} else {
				jsonObject["choices"]?.jsonArray?.firstOrNull()?.jsonObject?.get("message")
					?.jsonObject?.get("content")?.jsonPrimitive?.content
			}
			return msg ?: ""
    }
  }
}