import { describe, expect, test } from "vitest"
import {
  type ComputerRawEnvelope,
  computerConvertEnvelope,
} from "#synapse/modules/computer-use/adapters/driver-response-validation"

describe("computerConvertEnvelope", () => {
  test("preserva a mensagem de texto de um click quando há structuredContent", () => {
    const input: ComputerRawEnvelope = {
      content: [{ type: "text", text: "✅ Posted click to pid 28096." }],
      structuredContent: { verified: false, effect: "unverifiable" },
    }

    const envelope = computerConvertEnvelope(input)

    expect(envelope.message).toBe("✅ Posted click to pid 28096.")
    expect(envelope.effect).toBe("unverifiable")
    expect(envelope.isError).toBe(false)
  })

  test("preserva a mensagem de erro do driver quando há structuredContent", () => {
    const input: ComputerRawEnvelope = {
      content: [{ type: "text", text: "driver error: window not found (pid 28096, window 4459650)" }],
      structuredContent: { code: "transport_outcome_unknown", effect: "unverifiable" },
      isError: true,
    }

    const envelope = computerConvertEnvelope(input)

    expect(envelope.message).toMatch(/driver error: window not found/)
    expect(envelope.code).toBe("transport_outcome_unknown")
    expect(envelope.isError).toBe(true)
  })

  test("não sobrescreve a mensagem fornecida em structuredContent", () => {
    const input: ComputerRawEnvelope = {
      content: [{ type: "text", text: "texto auxiliar" }],
      structuredContent: { message: "captura concluída", verified: true, effect: "confirmed" },
    }

    const envelope = computerConvertEnvelope(input)

    expect(envelope.message).toBe("captura concluída")
    expect(envelope.verified).toBe(true)
    expect(envelope.effect).toBe("confirmed")
  })

  test("mantém o parse de resposta só-texto JSON", () => {
    const input: ComputerRawEnvelope = {
      content: [{ type: "text", text: '{"message":"hello","effect":"unverifiable"}' }],
    }

    const envelope = computerConvertEnvelope(input)

    expect(envelope.message).toBe("hello")
    expect(envelope.effect).toBe("unverifiable")
  })

  test("usa o texto quando structuredContent.message é vazio", () => {
    const input: ComputerRawEnvelope = {
      content: [{ type: "text", text: "fallback text" }],
      structuredContent: { message: "", verified: false, effect: "unverifiable" },
    }

    const envelope = computerConvertEnvelope(input)

    expect(envelope.message).toBe("fallback text")
  })

  test("não usa texto JSON como fallback quando há structuredContent", () => {
    const input: ComputerRawEnvelope = {
      content: [{ type: "text", text: '{"message":"não usar","effect":"unverifiable"}' }],
      structuredContent: { verified: false, effect: "unverifiable" },
    }

    const envelope = computerConvertEnvelope(input)

    expect(envelope.message).toBe("")
  })
})
