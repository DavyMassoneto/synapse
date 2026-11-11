import { describe, expect, test } from "vitest"
import { parseModelReference } from "../public"

function splitsAtFirstSeparator(): void {
  expect(parseModelReference("omniroute/cc/claude-opus")).toStrictEqual({
    kind: "valid",
    provider: "omniroute",
    id: "cc/claude-opus",
  })
}

function rejectsIncompleteReference(reference: string): void {
  expect(parseModelReference(reference)).toStrictEqual({ kind: "invalid" })
}

function registerTests(): void {
  test("referência é separada no primeiro separador", splitsAtFirstSeparator)
  test.each(["", "modelo", "/modelo", "provedor/"])("referência incompleta %j é rejeitada", rejectsIncompleteReference)
}

describe("model reference", registerTests)
