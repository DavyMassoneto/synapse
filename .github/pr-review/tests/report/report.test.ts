import { describe, expect, test } from "vitest"
import { type ChangedFile } from "#synapse/diff"
import {
  buildLabels,
  groupByLine,
  partitionFindings,
  renderFailure,
  renderInline,
  renderSummaryPages,
} from "#synapse/report"
import { type ReviewResult } from "#synapse/review"
import { loadRuleGroups } from "#synapse/rules"
import { FINDING_GENERAL, FINDING_OFF_DIFF, FINDING_ON_ADDED } from "#synapse/tests/fixtures/review"

const FILES: ChangedFile[] = [{ path: "src/a.ts", addedLines: new Set([11]), commentableLines: new Set([10, 11]) }]
const RESULT: ReviewResult = {
  verdict: "ATENÇÃO",
  findings: [FINDING_ON_ADDED, FINDING_OFF_DIFF, FINDING_GENERAL],
  notes: ["Revisão incompleta: teste."],
}
const LABELS = buildLabels(loadRuleGroups())

describe("partitionFindings", () => {
  test("anchors a finding on a commentable line, leaves others outside and keeps general ones apart", () => {
    const partition = partitionFindings(RESULT.findings, FILES)
    expect([partition.anchored, partition.outsideDiff, partition.general]).toEqual([
      [FINDING_ON_ADDED],
      [FINDING_OFF_DIFF],
      [FINDING_GENERAL],
    ])
  })
})

describe("groupByLine", () => {
  test("puts the findings of one line in one comment", () => {
    const second = { ...FINDING_ON_ADDED, rule: "C03" }
    expect(groupByLine([FINDING_ON_ADDED, second]).map((group) => group.findings.length)).toEqual([2])
  })
})

describe("renderInline", () => {
  test("starts with the marker and labels every rule", () => {
    const group = groupByLine([FINDING_ON_ADDED])[0]
    expect(
      renderInline(LABELS, { path: "src/a.ts", line: 11, findings: group === undefined ? [] : group.findings }),
    ).toBe("<!-- pr-review-bot:inline -->\n- **[C01 COMENTARIO]** problema")
  })
})

describe("renderSummaryPages", () => {
  const page = renderSummaryPages(RESULT, LABELS, FILES).join("")

  test("states the verdict and the counts per rule", () => {
    expect(page).toContain("**Veredito: ATENÇÃO**")
    expect(page).toContain("3 achado(s)")
  })

  test("lists the findings that have no comment line", () => {
    expect(page).toContain("`src/a.ts:99`")
    expect(page).toContain("descricao falsa")
  })

  test("carries the incomplete note", () => {
    expect(page).toContain("Revisão incompleta: teste.")
  })

  test("splits a long report in pages with their own markers", () => {
    const many: ReviewResult = {
      ...RESULT,
      findings: Array.from({ length: 400 }, (_, index) => ({
        ...FINDING_OFF_DIFF,
        line: index + 100,
        body: "x".repeat(400),
      })),
    }
    expect(renderSummaryPages(many, LABELS, FILES).length).toBeGreaterThan(1)
  })
})

describe("renderFailure", () => {
  test("carries the failure verdict and the reason", () => {
    expect(renderFailure("HTTP 500")).toContain("**Veredito: FALHA**")
    expect(renderFailure("HTTP 500")).toContain("HTTP 500")
  })
})
