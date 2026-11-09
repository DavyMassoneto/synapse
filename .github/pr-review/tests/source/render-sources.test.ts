import { mkdtempSync, rmSync, writeFileSync } from "node:fs"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { afterEach, beforeEach, describe, expect, test } from "vitest"
import { type ChangedFile } from "#synapse/diff"
import { buildNotes, reviewAll } from "#synapse/review"
import { renderSources } from "#synapse/source"
import { REVIEW_INPUT, RULE_IDS, replyJson } from "#synapse/tests/fixtures/review"
import { SETTINGS } from "#synapse/tests/fixtures/settings"
import { ScriptedCaller } from "#synapse/tests/review"

let directory = ""

function changedFile(name: string, added: number[]): ChangedFile {
  return { path: join(directory, name), addedLines: new Set(added), commentableLines: new Set<number>() }
}

function textOf(name: string, added: number[]): string {
  return renderSources([changedFile(name, added)])
    .map((source) => source.text)
    .join("")
}

beforeEach(() => {
  directory = mkdtempSync(join(tmpdir(), "pr-review-"))
})

afterEach(() => {
  rmSync(directory, { recursive: true })
})

describe("renderSources", () => {
  test("marks only the lines the pr changed", () => {
    writeFileSync(join(directory, "a.ts"), "um\ndois\ntres\n")
    expect(textOf("a.ts", [2])).toContain("    2 + dois")
    expect(textOf("a.ts", [2])).toContain("    1   um")
  })

  test("counts lines the way git does", () => {
    writeFileSync(join(directory, "a.ts"), "um\ndois\n")
    expect(textOf("a.ts", [])).toContain("(2 linhas;")
  })

  test("does not split on a form feed", () => {
    writeFileSync(join(directory, "a.ts"), "um\u000cdois\n")
    expect(textOf("a.ts", [])).toContain("(1 linhas;")
  })

  test("flags a missing file as incomplete", () => {
    expect(renderSources([changedFile("gone.ts", [])]).at(0)?.incomplete).toBe(true)
  })

  test("flags a file with invalid utf8 as incomplete", () => {
    writeFileSync(join(directory, "a.ts"), Buffer.from([0xff, 0xfe]))
    expect(renderSources([changedFile("a.ts", [])]).at(0)?.incomplete).toBe(true)
  })

  test("sends the last line beyond 100000 characters to the model without incomplete notes", async () => {
    const marker = "UNIQUE_LAST_LINE_INPUT_INTEGRITY"
    writeFileSync(join(directory, "a.ts"), `${"x".repeat(120_000)}\n${marker}\n`)
    const sources = renderSources([changedFile("a.ts", [2])])
    const caller = new ScriptedCaller([replyJson([], RULE_IDS)])
    const result = await reviewAll({
      caller: (messages) => caller.call(messages),
      settings: SETTINGS,
      input: REVIEW_INPUT,
      systemPrompt: "system",
      ruleIds: RULE_IDS,
      sources,
    })
    expect(caller.received.at(0)?.at(1)?.content).toContain(marker)
    expect(sources.at(0)?.incomplete).toBe(false)
    expect(buildNotes({ findings: [], complete: true }, sources)).toEqual([])
    expect(result.notes).toEqual([])
  })
})
