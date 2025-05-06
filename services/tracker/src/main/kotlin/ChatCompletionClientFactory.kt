package com.trash.services.tracker

import jakarta.inject.Singleton

@Singleton
class ChatCompletionClientFactory(
  private val openAIClient: OpenAIClient,
  private val geminiClient: GeminiClient
) {
  fun getClient(model: String): ChatCompletionClient {
    return when (model.lowercase()) {
      "openai" -> openAIClient
      "gemini" -> geminiClient
      else -> {
        geminiClient
      }
    }
  }
}