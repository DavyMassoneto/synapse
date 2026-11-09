import { describe, expect, test } from "vitest"
import { collectContent } from "#synapse/client"
import { ModelError } from "#synapse/errors"
import { sseOf } from "#synapse/tests/client"

function streamOf(text: string): ReadableStream<Uint8Array> {
  return new ReadableStream<Uint8Array>({
    start(controller: ReadableStreamDefaultController<Uint8Array>) {
      controller.enqueue(new TextEncoder().encode(text))
      controller.close()
    },
  })
}

describe("collectContent", () => {
  test("joins the pieces of every event", async () => {
    expect(await collectContent(streamOf(sseOf("a", "b")))).toBe("ab")
  })

  test("shows the start of the stream when it carries no content", async () => {
    await expect(collectContent(streamOf('{"choices":[{"message":{"content":"x"}}]}'))).rejects.toThrow(ModelError)
    await expect(collectContent(streamOf("plain body"))).rejects.toThrow("plain body")
  })
})
