import { describe, expect, test } from "vitest"
import { formatModelReference, parseModelReference } from "../public"

function roundTrip(): void {
  const reference = formatModelReference("omniroute", "cc/claude-opus")
  expect(reference).toBe("omniroute/cc/claude-opus")
  expect(parseModelReference(reference)).toStrictEqual({ kind: "valid", provider: "omniroute", id: "cc/claude-opus" })
}

function rejectsIncompleteReference(reference: string): void {
  expect(parseModelReference(reference)).toStrictEqual({ kind: "invalid" })
}

function registerTests(): void {
  test("referência montada é interpretada de volta", roundTrip)
  test.each(["", "modelo", "/modelo", "provedor/"])("referência incompleta %j é rejeitada", rejectsIncompleteReference)
}

describe("model reference", registerTests)
