package com.trash.libraries.xproto

import com.trash.tracker.v1.TrashItem
import io.kotest.core.spec.style.FunSpec


class XprotoTest(): FunSpec({
  test("create a proto") {
    TrashItem.newBuilder().build()
  }
})
