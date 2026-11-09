import { expect, test } from "vitest"
import { annotateDiff } from "../diff"
import { type Finding } from "../model"
import { placeFindings } from "./place-findings"

const DIFF = [
  "diff --git a/src/a.ts b/src/a.ts",
  "--- a/src/a.ts",
  "+++ b/src/a.ts",
  "@@ -1,2 +1,4 @@",
  " keep",
  "+one",
  "+two",
  "+three",
  "@@ -20,1 +22,2 @@",
  " far",
  "+extra",
  "",
].join("\n")

function finding(overrides: Partial<Finding>): Finding {
  return {
    criterion: "clean-code",
    kind: "violation",
    path: "src/a.ts",
    line: 2,
    side: "RIGHT",
    rule: "legibilidade §8",
    evidence: "evidência",
    impact: "impacto",
    fix: "correção",
    ...overrides,
  }
}

const { lines } = annotateDiff(DIFF)

test("apontamento numa linha do diff vira comentário nessa linha e lado", () => {
  const placement = placeFindings(lines, [finding({ line: 3 })])
  expect(placement.unplaced).toHaveLength(0)
  expect(placement.comments).toHaveLength(1)
  expect(placement.comments[0]).toMatchObject({ path: "src/a.ts", line: 3, side: "RIGHT" })
  expect(placement.comments[0]?.body).toContain("Clean Code · violação")
})

test("intervalo válido usa start_line e start_side", () => {
  const placement = placeFindings(lines, [finding({ startLine: 2, line: 4 })])
  expect(placement.comments[0]).toMatchObject({ line: 4, start_line: 2, start_side: "RIGHT" })
})

test("intervalo que sai do diff vira comentário de linha única", () => {
  const placement = placeFindings(lines, [finding({ startLine: 3, line: 23 })])
  expect(placement.comments[0]?.start_line).toBeUndefined()
  expect(placement.comments[0]).toMatchObject({ line: 23 })
})

test("linha, lado ou arquivo que o diff não mostra ficam sem linha", () => {
  const placement = placeFindings(lines, [
    finding({ line: 9 }),
    finding({ side: "LEFT", line: 2 }),
    finding({ path: "src/inexistente.ts" }),
  ])
  expect(placement.comments).toHaveLength(0)
  expect(placement.unplaced).toHaveLength(3)
})

test("apontamentos na mesma linha viram um só comentário", () => {
  const placement = placeFindings(lines, [finding({ line: 3 }), finding({ line: 3, criterion: "dry" })])
  expect(placement.comments).toHaveLength(1)
  expect(placement.comments[0]?.body).toContain("DRY")
  expect(placement.comments[0]?.body).toContain("Clean Code")
})
