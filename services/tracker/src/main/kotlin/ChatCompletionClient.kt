package com.trash.services.tracker

interface ChatCompletionClient {
  fun getChatCompletion(promptPath: String, promptReplacements: Map<String, String>): String
}
