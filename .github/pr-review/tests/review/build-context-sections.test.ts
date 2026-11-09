import { describe, expect, test } from "vitest"
import { buildContextSections } from "#synapse/review"
import { RecordedRunner, SETTINGS } from "#synapse/tests/fixtures"

function answer(args: readonly string[]): string {
  if (args.includes("ls-tree")) {
    return "AGENTS.md\ndocs/image.png\nbiome/a.grit\n"
  }
  return `conteudo de ${args.at(-1)}`
}

describe("buildContextSections", () => {
  test("reads only the documents and configs from the base commit", () => {
    const runner = new RecordedRunner((request) => answer(request.args))
    const sections = buildContextSections((request) => runner.run(request), SETTINGS)
    expect(sections.length).toBe(2)
    expect(sections.at(0)).toContain("conteudo de base:AGENTS.md")
  })
})
