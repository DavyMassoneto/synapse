import { describe, expect, test } from "vitest"
import { readEvent } from "#synapse/client"

describe("readEvent", () => {
  test("reads the content of a data line", () => {
    expect(readEvent('data: {"choices":[{"delta":{"content":"oi"}}]}')).toBe("oi")
  })

  test("ignores a null content", () => {
    expect(readEvent('data: {"choices":[{"delta":{"content":null}}]}')).toBe("")
  })

  test("ignores the end marker and comments", () => {
    expect(readEvent("data: [DONE]") + readEvent(": ping")).toBe("")
  })
})
