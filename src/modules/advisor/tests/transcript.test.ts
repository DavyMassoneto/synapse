import { describe, expect, test } from "vitest"
import { buildTranscript, renderMessage, selectMessages } from "../internal"
import { type TranscriptMessage } from "../public"
import { RENDERED_MESSAGES } from "./constants"
import {
  CountingToolResult,
  CountingUserMessage,
  emptyConsultation,
  serviceFor,
  TestModel,
  TestStorage,
} from "./doubles"
import { type RenderedMessage } from "./types"

function emptyTranscript(): void {
  expect(buildTranscript([], 200)).toBe("")
}

function hiddenShell(): void {
  const messages: TranscriptMessage[] = [
    { kind: "shell", hidden: true, command: "secret", blocks: [{ kind: "text", text: "hidden" }] },
  ]
  expect(buildTranscript(messages, 200)).not.toContain("secret")
}

function toolErrorLabel(): void {
  const messages: TranscriptMessage[] = [
    { kind: "toolResult", tool: "read", error: true, blocks: [{ kind: "text", text: "failed" }] },
  ]
  expect(buildTranscript(messages, 200)).toMatch(/tool_result read \(error\)/)
}

function recentMessageFits(): void {
  const messages: TranscriptMessage[] = [
    { kind: "user", blocks: [{ kind: "text", text: "á".repeat(30_000) }] },
    { kind: "user", blocks: [{ kind: "text", text: "MOST_RECENT" }] },
  ]
  const text = buildTranscript(messages, 200)
  expect(text).toContain("MOST_RECENT")
  expect(text.length).toBeLessThanOrEqual(200)
}

function preservesBeginningAndEnd(): void {
  const messages: TranscriptMessage[] = [
    { kind: "user", blocks: [{ kind: "text", text: "FIRST_MESSAGE" }] },
    { kind: "user", blocks: [{ kind: "text", text: "middle".repeat(1000) }] },
    { kind: "user", blocks: [{ kind: "text", text: "LAST_MESSAGE" }] },
  ]
  const text = buildTranscript(messages, 200)
  expect(text).toContain("FIRST_MESSAGE")
  expect(text).toContain("LAST_MESSAGE")
  expect(text.length).toBeLessThanOrEqual(200)
}

function oversizedLastFits(): void {
  const messages: TranscriptMessage[] = [
    { kind: "user", blocks: [{ kind: "text", text: "FIRST_MESSAGE" }] },
    { kind: "user", blocks: [{ kind: "text", text: "last".repeat(1000) }] },
  ]
  expect(buildTranscript(messages, 200).length).toBeLessThanOrEqual(200)
}

async function smallContextFails(): Promise<void> {
  const storage = new TestStorage()
  const advisor = serviceFor(storage)
  const model = new TestModel()
  model.window = 100
  const result = await advisor.consult(emptyConsultation(new AbortController().signal), model)
  expect(result.kind).toBe("failure")
  expect(model.captured).toBeUndefined()
}

function clipsOnlyToolOutput(): void {
  const messages: TranscriptMessage[] = [
    { kind: "user", blocks: [{ kind: "text", text: "u".repeat(13_000) }] },
    { kind: "toolResult", tool: "read", error: false, blocks: [{ kind: "text", text: "t".repeat(13_000) }] },
  ]
  const text = buildTranscript(messages, 100_000)
  expect(text).toContain("u".repeat(13_000))
  expect(text).not.toContain("t".repeat(13_000))
  expect(text).toContain("conteúdo omitido")
}

function recentMessagesKeepOrder(): void {
  const blocks = ["FIRST", "A".repeat(100), "B".repeat(20), "C".repeat(20)]
  expect(selectMessages(blocks, 120)).toBe(
    ["FIRST", "[... mensagens anteriores omitidas ...]", "B".repeat(20), "C".repeat(20)].join("\n\n"),
  )
}

function singleOversizedMessage(): void {
  const block = `INICIO${"x".repeat(1_000)}FIM`
  const text = selectMessages([block], 200)
  expect(text.length).toBeLessThanOrEqual(200)
  expect(text.startsWith("INICIO")).toBe(true)
  expect(text.endsWith("FIM")).toBe(true)
  expect(text).not.toContain("mensagens anteriores omitidas")
}

function fixedMessagePreparedOnce(): void {
  const counting = new CountingUserMessage([{ kind: "text", text: "u".repeat(20_000) }])
  const messages: TranscriptMessage[] = [
    counting,
    { kind: "toolResult", tool: "read", error: false, blocks: [{ kind: "text", text: "t".repeat(20_000) }] },
  ]
  const text = buildTranscript(messages, 300)
  expect(text.length).toBeLessThanOrEqual(300)
  expect(counting.reads).toBe(2)
}

function lastPassKeepsRenderedBlocks(): void {
  const counting = new CountingToolResult([{ kind: "text", text: "t".repeat(20_000) }])
  const messages: TranscriptMessage[] = [counting, { kind: "user", blocks: [{ kind: "text", text: "FIM" }] }]
  const text = buildTranscript(messages, 200)
  expect(text.length).toBeLessThanOrEqual(200)
  expect(counting.reads).toBe(4)
}

function reducesToolOutputToFit(): void {
  const messages: TranscriptMessage[] = [
    { kind: "user", blocks: [{ kind: "text", text: "PEDIDO" }] },
    { kind: "toolResult", tool: "read", error: false, blocks: [{ kind: "text", text: "t".repeat(13_000) }] },
  ]
  const text = buildTranscript(messages, 5_000)
  expect(text.length).toBeLessThanOrEqual(5_000)
  expect(text).toContain("PEDIDO")
  expect(text).toContain("conteúdo omitido")
  expect(text).not.toContain("mensagens anteriores omitidas")
}

function noBudget(): void {
  const messages: TranscriptMessage[] = [{ kind: "user", blocks: [{ kind: "text", text: "PEDIDO" }] }]
  expect(buildTranscript(messages, 0)).toBe("")
}

function nothingToSelect(): void {
  expect(selectMessages([], 120)).toBe("")
}

function rendersOneLinePerBlock(example: RenderedMessage): void {
  expect(renderMessage(example.message, 500)).toBe(example.text)
}

function registerTests(): void {
  test("transcrição vazia", emptyTranscript)
  test.each(RENDERED_MESSAGES)("mensagem $name sai com o rótulo e uma linha por bloco", rendersOneLinePerBlock)
  test("shell oculto não aparece na transcrição", hiddenShell)
  test("resultado de ferramenta identifica erro", toolErrorLabel)
  test("mensagem recente cabe no orçamento", recentMessageFits)
  test("início e fim são preservados", preservesBeginningAndEnd)
  test("última mensagem excessiva respeita orçamento", oversizedLastFits)
  test("janela muito pequena retorna falha antes de chamar o modelo", smallContextFails)
  test("só a saída de ferramenta é cortada", clipsOnlyToolOutput)
  test("mensagens recentes mantêm a ordem e a mais antiga é omitida", recentMessagesKeepOrder)
  test("sem mensagens não há seleção", nothingToSelect)
  test("mensagem que não depende do limite é preparada uma vez", fixedMessagePreparedOnce)
  test("saída de ferramenta é reduzida até caber", reducesToolOutputToFit)
  test("a última passagem não renderiza de novo os blocos já renderizados", lastPassKeepsRenderedBlocks)
  test("orçamento zero devolve transcrição vazia", noBudget)
  test("mensagem única maior que o orçamento é cortada sem aviso de omissão", singleOversizedMessage)
}

describe("transcript", registerTests)
