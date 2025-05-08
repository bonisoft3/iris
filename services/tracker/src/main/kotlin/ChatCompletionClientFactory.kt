package com.trash.services.tracker

import io.micronaut.context.annotation.Value
import jakarta.inject.Singleton

@Singleton
class ChatCompletionClientFactory(
    private val openAIClient: OpenAIClient,
    private val geminiClient: GeminiClient,
    @Value("\${chat.env}")
    private val environment: String
) {
    fun getClient(model: String): ChatCompletionClient {
        return when {
            environment.lowercase() == "test" -> openAIClient
            model.lowercase() == "openai" -> openAIClient
            model.lowercase() == "gemini" -> geminiClient
            else -> geminiClient
        }
    }
}
