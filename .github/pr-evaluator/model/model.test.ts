import { expect, test } from "vitest"
import { parseReply } from "./parse-reply"
import { readStream } from "./read-stream"

function streamOf(text: string): ReadableStream<Uint8Array> {
  const bytes = new TextEncoder().encode(text)
  return new ReadableStream<Uint8Array>({
    start(controller) {
      controller.enqueue(bytes.slice(0, 20))
      controller.enqueue(bytes.slice(20))
      controller.close()
    },
  })
}

test("junta o conteúdo dos eventos, ignora comentários e encerramento, e guarda o motivo do fim", async () => {
  const text = [
    ": keepalive",
    'data: {"choices":[{"delta":{"content":"{\\"a\\":"},"finish_reason":null}]}',
    "",
    'data: {"choices":[{"delta":{"content":"1}"},"finish_reason":"stop"}]}',
    "",
    "data: [DONE]",
    "",
  ].join("\n")
  const result = await readStream(streamOf(text))
  expect(result).toStrictEqual({ content: '{"a":1}', finishReason: "stop" })
})

test("erro enviado pelo provedor no fluxo falha com a mensagem dele", async () => {
  const text = 'data: {"error":{"message":"sem crédito"}}\n\n'
  await expect(readStream(streamOf(text))).rejects.toThrow(/sem crédito/)
})

const REPLY = '{"verdict":"approve","summary":"ok","findings":[]}'

test("aceita o JSON puro e o JSON dentro de uma única cerca de código", () => {
  expect(parseReply(REPLY).verdict).toBe("approve")
  expect(parseReply(`\`\`\`json\n${REPLY}\n\`\`\`\n`).verdict).toBe("approve")
})

test("rejeita texto fora do JSON", () => {
  expect(() => parseReply(`Segue: ${REPLY}`)).toThrow(/fora do formato/)
  expect(() => parseReply(`${REPLY} Espero ter ajudado.`)).toThrow(/fora do formato/)
})

test("rejeita JSON que não segue o formato", () => {
  expect(() => parseReply('{"verdict":"talvez","summary":"x","findings":[]}')).toThrow(/fora do formato/)
  expect(() => parseReply("sem json")).toThrow(/fora do formato/)
})

test("rejeita apontamento sem linha", () => {
  const reply =
    '{"verdict":"request_changes","summary":"x","findings":[{"criterion":"dry","kind":"violation","path":"a.ts","side":"RIGHT","rule":"r","evidence":"e","impact":"i","fix":"f"}]}'
  expect(() => parseReply(reply)).toThrow(/fora do formato/)
})
