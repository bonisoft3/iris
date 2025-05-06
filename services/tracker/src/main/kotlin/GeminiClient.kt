package com.trash.services.tracker

import io.micronaut.context.annotation.Value
import jakarta.inject.Singleton
import kotlinx.serialization.json.Json
import kotlinx.serialization.json.jsonArray
import kotlinx.serialization.json.jsonObject
import kotlinx.serialization.json.jsonPrimitive
import okhttp3.MediaType.Companion.toMediaType
import okhttp3.OkHttpClient
import okhttp3.Request
import okhttp3.RequestBody.Companion.toRequestBody
import java.util.concurrent.TimeUnit

@Singleton
class GeminiClient(
	@Value("\${gemini.api.url}") private val geminiApiUrl: String,
	@Value("\${gemini.endpoint.generate-content}") private val chatCompletionEndpoint: String,
	@Value("\${gemini.api.key}") private val apiKey: String,
) : ChatCompletionClient {
	private val client: OkHttpClient = OkHttpClient.Builder()
		.readTimeout(600, TimeUnit.SECONDS)
		.build()

	private val json = Json {
		ignoreUnknownKeys = true
		explicitNulls = false
	}

	
	override fun getChatCompletion(promptPath: String, promptReplacements: Map<String, String>): String {
		var promptPathPrefix = "classpath:prompts/gemini_"
		val fullPromptPath = "$promptPathPrefix$promptPath"
		val jsonContent = JsonHelper.getJsonContentFromPath(fullPromptPath, promptReplacements).trimIndent()

		val mediaType = "application/json".toMediaType()
		val body = jsonContent.toRequestBody(mediaType)

		val request = Request.Builder()
			.url("$geminiApiUrl$chatCompletionEndpoint?key=$apiKey")
			.post(body)
			.addHeader("Content-Type", "application/json")
			.build()

		client.newCall(request).execute().use { response ->
			if (!response.isSuccessful) {
				throw RuntimeException(
					"Failed to get response from ${request.url}: ${response.code} ${response.message}"
				)
			}
			val responseBody = response.body!!.string()
			return processResponse(responseBody)
		}
	}

	private fun processResponse(rawResponse: String): String {
		return try {
			val jsonObject = json.parseToJsonElement(rawResponse).jsonObject

			val msg = jsonObject["candidates"]?.jsonArray?.firstOrNull()?.jsonObject
				?.get("content")?.jsonObject
				?.get("parts")?.jsonArray?.firstOrNull()?.jsonObject
				?.get("text")?.jsonPrimitive?.content

			msg ?: "No response"
		} catch (e: Exception) {
			"Error parsing API response: ${e.message}. Raw response: $rawResponse"
		}
	}
}
