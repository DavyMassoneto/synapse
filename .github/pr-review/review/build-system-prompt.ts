import { join } from "node:path"
import { type RuleGroup } from "../rules"
import { PARAGRAPH_BREAK } from "../separators"
import { type Settings } from "../settings"
import { type CommandRunner } from "../shell"
import { readText } from "../source"
import { buildContextSections } from "./build-context-sections"
import { FORMAT_FILE, PROMPT_FILES, PROMPTS_DIR } from "./constants"

export function buildSystemPrompt(runner: CommandRunner, settings: Settings, groups: RuleGroup[]): string {
  const prompts = PROMPT_FILES.map((file) => readText(join(PROMPTS_DIR, file)))
  const rules = groups.map((group) => group.text)
  const format = readText(join(PROMPTS_DIR, FORMAT_FILE))
  return [...prompts, ...rules, ...buildContextSections(runner, settings), format].join(PARAGRAPH_BREAK)
}
