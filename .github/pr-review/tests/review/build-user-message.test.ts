import { describe, expect, test } from "vitest"
import { buildUserMessage } from "#synapse/review"
import { SETTINGS } from "#synapse/tests/fixtures"

const CHUNK = [{ path: "a.ts", text: "=== a.ts", incomplete: false }]

describe("buildUserMessage", () => {
  test("marks an empty description and no deleted files", () => {
    const message = buildUserMessage(
      { ...SETTINGS, prBody: "  " },
      { treeListing: "arvore", deletedPaths: [] },
      CHUNK,
      1,
      1,
    )
    expect(message).toContain("(sem descrição)")
    expect(message).toContain("Arquivos apagados pela PR: (nenhum)")
  })

  test("numbers the part and lists the deleted files", () => {
    const message = buildUserMessage(SETTINGS, { treeListing: "arvore", deletedPaths: ["old.ts", "x.ts"] }, CHUNK, 2, 3)
    expect(message).toContain("parte 2 de 3")
    expect(message).toContain("old.ts, x.ts")
  })

  test("carries the description of the pr and the files", () => {
    const message = buildUserMessage(SETTINGS, { treeListing: "arvore", deletedPaths: [] }, CHUNK, 1, 1)
    expect(message).toContain("descricao")
    expect(message).toContain("=== a.ts")
  })
})
