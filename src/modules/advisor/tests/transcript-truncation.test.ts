import { describe, expect, test } from "vitest"
import { buildTranscript } from "../internal"
import { type TranscriptMessage } from "../public"

function originalTaskAndGap(): void {
  const task = `TAREFA_ORIGINAL ${"x".repeat(300)}`
  const messages: TranscriptMessage[] = [{ kind: "user", blocks: [{ kind: "text", text: task }] }]
  for (let index = 0; index < 5; index++) {
    messages.push({
      kind: "assistant",
      blocks: [{ kind: "text", text: `MID${index}${"y".repeat(150)}` }],
    })
  }
  messages.push({ kind: "user", blocks: [{ kind: "text", text: `ULTIMA ${"z".repeat(400)}` }] })
  const result = buildTranscript(messages, 700)
  expect(result).toContain(task)
  expect(result.indexOf(task)).toBeLessThan(result.indexOf("mensagens anteriores omitidas"))
  expect(result.indexOf("mensagens anteriores omitidas")).toBeLessThan(result.indexOf("ULTIMA"))
  expect(result.length).toBeLessThanOrEqual(700)
}

function registerTests(): void {
  test("preserva tarefa original antes da lacuna e mensagens recentes", originalTaskAndGap)
}

describe("transcript truncation", registerTests)
