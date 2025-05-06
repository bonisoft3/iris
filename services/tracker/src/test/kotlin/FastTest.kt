package com.trash.services.tracker

import io.kotest.core.spec.style.BehaviorSpec
import io.kotest.matchers.shouldBe

class FastTest() : BehaviorSpec({
  given("nothing") {
    `when`("neither") {
      then("true") {
        true shouldBe true
      }
    }
  }
})
