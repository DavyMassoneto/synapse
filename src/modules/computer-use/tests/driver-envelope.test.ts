import { describe, expect, test } from "vitest"
import { computerConvertEnvelope } from "../adapters"
import { computerTestPng } from "./support"

function imageBeforeText(): void {
  const data = Buffer.from(computerTestPng()).toString("base64")
  const envelope = computerConvertEnvelope({
    content: [
      { type: "image", data, mimeType: "image/png" },
      { type: "text", text: "Window tree" },
    ],
  })
  expect(envelope.image).toMatchObject({ kind: "image-present", data })
  expect(envelope.message).toBe("Window tree")
  expect(envelope.tree).toBe("Window tree")
}

function invalidImageBeforeText(): void {
  const envelope = computerConvertEnvelope({
    content: [
      { type: "image", data: "invalid", mimeType: "image/png" },
      { type: "text", text: "Window tree" },
    ],
  })
  expect(envelope.image.kind).toBe("image-absent")
  expect(envelope.tree).toBe("Window tree")
}

function jsonTextState(): void {
  const envelope = computerConvertEnvelope({ content: [{ type: "text", text: ' {"message":"Done","verified":true}' }] })
  expect(envelope.message).toBe("Done")
  expect(envelope.verified).toBe(true)
}

function register(): void {
  test("texto sem conteúdo estruturado preserva imagem anterior", imageBeforeText)
  test("imagem inválida não gera captura visual", invalidImageBeforeText)
  test("continua interpretando estado em texto JSON", jsonTextState)
}

describe("conteúdo do envelope do driver", register)
