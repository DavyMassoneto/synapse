import { readFileSync } from "node:fs"
import { describe, expect, test } from "vitest"
import { buildSystemPrompt } from "#synapse/review"
import { loadRuleGroups } from "#synapse/rules"
import { TEXT_ENCODING } from "#synapse/separators"
import { SETTINGS } from "#synapse/tests/fixtures/settings"
import { RecordedRunner } from "#synapse/tests/fixtures/shell"

function promptFile(name: string): string {
  return readFileSync(new URL(`../../prompts/${name}.md`, import.meta.url), TEXT_ENCODING)
}

describe("buildSystemPrompt", () => {
  test("orders instructions, rules, base context and the response format", () => {
    const runner = new RecordedRunner((request) => (request.args.includes("ls-tree") ? "AGENTS.md\n" : "base context"))
    const groups = loadRuleGroups()
    const prompt = buildSystemPrompt((request) => runner.run(request), SETTINGS, groups)
    const sections = [
      promptFile("method"),
      promptFile("standards"),
      ...groups.map((group) => group.text),
      "base context",
      promptFile("format"),
    ]
    let previousPosition = -1
    for (const section of sections) {
      const position = prompt.indexOf(section)
      expect(position).toBeGreaterThan(previousPosition)
      previousPosition = position
    }
    expect(prompt.endsWith(promptFile("format"))).toBe(true)
  })
})
