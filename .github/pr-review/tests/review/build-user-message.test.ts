import { describe, expect, test } from "vitest"
import { buildUserMessage } from "#synapse/review"
import { REVIEW_INPUT, SOURCE_A } from "#synapse/tests/fixtures/review"
import { SETTINGS } from "#synapse/tests/fixtures/settings"

const SOURCES = [SOURCE_A]

describe("buildUserMessage", () => {
  test("marks an empty description and no deleted files", () => {
    const message = buildUserMessage({ ...SETTINGS, prBody: "  " }, REVIEW_INPUT, SOURCES)
    expect(message).toContain("(sem descrição)")
    expect(message).toContain("Arquivos apagados pela PR: (nenhum)")
  })

  test("lists the deleted files without splitting the review", () => {
    const message = buildUserMessage(SETTINGS, { ...REVIEW_INPUT, deletedPaths: ["old.ts", "x.ts"] }, SOURCES)
    expect(message).not.toContain("parte")
    expect(message).toContain("old.ts, x.ts")
  })

  test("carries the description of the pr and the files", () => {
    const message = buildUserMessage(SETTINGS, REVIEW_INPUT, SOURCES)
    expect(message).toContain("descricao")
    expect(message).toContain("=== a.ts")
  })
})
