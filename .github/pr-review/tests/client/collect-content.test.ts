import { describe, expect, test } from "vitest"
import { collectContent } from "#synapse/client"
import { ModelError } from "#synapse/errors"
import { sseOf, sseWithFinish } from "#synapse/tests/client"
import { replyJson } from "#synapse/tests/fixtures/review"

function streamOf(text: string): ReadableStream<Uint8Array> {
  return streamChunks([new TextEncoder().encode(text)])
}

function streamChunks(chunks: Uint8Array[]): ReadableStream<Uint8Array> {
  return new ReadableStream<Uint8Array>({
    start(controller: ReadableStreamDefaultController<Uint8Array>) {
      for (const chunk of chunks) {
        controller.enqueue(chunk)
      }
      controller.close()
    },
  })
}

describe("collectContent", () => {
  test("collects an event split across two byte chunks", async () => {
    const bytes = new TextEncoder().encode(sseOf("reply"))
    expect(await collectContent(streamChunks([bytes.slice(0, 15), bytes.slice(15)]))).toBe("reply")
  })

  test("decodes a UTF-8 character split across byte chunks", async () => {
    const bytes = new TextEncoder().encode(sseOf("ã"))
    const split = bytes.indexOf(0xc3) + 1
    expect(await collectContent(streamChunks([bytes.slice(0, split), bytes.slice(split)]))).toBe("ã")
  })

  test("rejects length termination even when the accumulated reply is valid json", async () => {
    const content = replyJson([], [])
    await expect(collectContent(streamOf(sseWithFinish("length", content)))).rejects.toThrow(ModelError)
    await expect(collectContent(streamOf(sseWithFinish("length", content)))).rejects.toThrow(
      `resposta interrompida pelo limite de saída (finish_reason=length); recebidos ${content.length} caracteres`,
    )
  })
  test.each(["stop", null, "tool_calls"])("preserves content with finish reason %s", async (reason) => {
    expect(await collectContent(streamOf(sseWithFinish(reason, "a", "b")))).toBe("ab")
  })

  test("rejects length termination with invalid json and reports all received characters", async () => {
    await expect(collectContent(streamOf(sseWithFinish("length", '{"find', 'ings": [')))).rejects.toThrow(
      "resposta interrompida pelo limite de saída (finish_reason=length); recebidos 14 caracteres",
    )
  })

  test("joins the pieces of every event", async () => {
    expect(await collectContent(streamOf(sseOf("a", "b")))).toBe("ab")
  })

  test("shows the start of the stream when it carries no content", async () => {
    await expect(collectContent(streamOf('{"choices":[{"message":{"content":"x"}}]}'))).rejects.toThrow(ModelError)
    await expect(collectContent(streamOf("plain body"))).rejects.toThrow("plain body")
  })
})
