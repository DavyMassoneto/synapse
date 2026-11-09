import { describe, expect, test } from "vitest"
import { readEvent } from "#synapse/client"

describe("readEvent", () => {
  test("reads the content of a data line", () => {
    expect(readEvent('data: {"choices":[{"delta":{"content":"oi"}}]}', 0)).toBe("oi")
  })

  test("ignores a null content", () => {
    expect(readEvent('data: {"choices":[{"delta":{"content":null}}]}', 0)).toBe("")
  })

  test("ignores the end marker and comments", () => {
    expect(readEvent("data: [DONE]", 0) + readEvent(": ping", 0)).toBe("")
  })

  test("reports accumulated characters including the length chunk content", () => {
    expect(() => readEvent('data: {"choices":[{"delta":{"content":"oi"},"finish_reason":"length"}]}', 10)).toThrow(
      "resposta interrompida pelo limite de saída (finish_reason=length); recebidos 12 caracteres",
    )
  })
})
