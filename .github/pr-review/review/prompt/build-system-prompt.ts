import { join } from "node:path"
import { type RuleGroup } from "#synapse/rules"
import { LINE_BREAK, PARAGRAPH_BREAK } from "#synapse/separators"
import { type Settings } from "#synapse/settings"
import { type CommandRunner, runGit } from "#synapse/shell"
import { readText } from "#synapse/source"
import {
  BASE_REFERENCE_SEPARATOR,
  CONTEXT_HEADER,
  CONTEXT_ROOTS,
  CONTEXT_SUFFIXES,
  FORMAT_FILE,
  LIST_TREE_ARGUMENTS,
  PATHSPEC_SEPARATOR,
  PROMPT_FILES,
  PROMPTS_DIR,
  SHOW_ARGUMENT,
} from "./constants"

export function buildSystemPrompt(runner: CommandRunner, settings: Settings, groups: RuleGroup[]): string {
  const prompts = PROMPT_FILES.map((file) => readText(join(PROMPTS_DIR, file)))
  const rules = groups.map((group) => group.text)
  const format = readText(join(PROMPTS_DIR, FORMAT_FILE))
  return [...prompts, ...rules, ...buildContextSections(runner, settings), format].join(PARAGRAPH_BREAK)
}

export function buildContextSections(runner: CommandRunner, settings: Settings): string[] {
  return listBasePaths(runner, settings).map(
    (path) => CONTEXT_HEADER + path + PARAGRAPH_BREAK + readBaseFile(runner, settings, path) + LINE_BREAK,
  )
}

export function listBasePaths(runner: CommandRunner, settings: Settings): string[] {
  const listing = runGit(runner, [...LIST_TREE_ARGUMENTS, settings.baseSha, PATHSPEC_SEPARATOR, ...CONTEXT_ROOTS])
  return listing.split(LINE_BREAK).filter((path) => CONTEXT_SUFFIXES.some((suffix) => path.endsWith(suffix)))
}

export function readBaseFile(runner: CommandRunner, settings: Settings, path: string): string {
  return runGit(runner, [SHOW_ARGUMENT, settings.baseSha + BASE_REFERENCE_SEPARATOR + path])
}
