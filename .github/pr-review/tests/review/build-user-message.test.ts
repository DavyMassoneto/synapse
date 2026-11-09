import { describe, expect, test } from "vitest"
import { buildUserMessage } from "#synapse/review"
import { REVIEW_INPUT, SOURCE_A } from "#synapse/tests/fixtures/review"
import { SETTINGS } from "#synapse/tests/fixtures/settings"

const CHUNK = [SOURCE_A]

describe("buildUserMessage", () => {
  test("marks an empty description and no deleted files", () => {
    const message = buildUserMessage({ ...SETTINGS, prBody: "  " }, REVIEW_INPUT, CHUNK, 1, 1)
    expect(message).toContain("(sem descrição)")
    expect(message).toContain("Arquivos apagados pela PR: (nenhum)")
  })

  test("numbers the part and lists the deleted files", () => {
    const message = buildUserMessage(SETTINGS, { ...REVIEW_INPUT, deletedPaths: ["old.ts", "x.ts"] }, CHUNK, 2, 3)
    expect(message).toContain("parte 2 de 3")
    expect(message).toContain("old.ts, x.ts")
  })

  test("carries the description of the pr and the files", () => {
    const message = buildUserMessage(SETTINGS, REVIEW_INPUT, CHUNK, 1, 1)
    expect(message).toContain("descricao")
    expect(message).toContain("=== a.ts")
  })
})
