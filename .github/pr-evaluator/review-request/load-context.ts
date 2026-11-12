import { readdirSync, readFileSync } from "node:fs"
import { join } from "node:path"
import {
  ARCHITECTURE_FILE,
  MARKDOWN_EXTENSION,
  PROMPT_ENCODING,
  RULES_FILE,
  STANDARD_BREAK,
  STANDARDS_DIRECTORY,
  TEMPLATE_FILE,
  TEMPLATE_PATTERN,
} from "./constants"
import { type PromptContext } from "./types"

function readText(root: string, file: string): string {
  return readFileSync(join(root, file), PROMPT_ENCODING)
}

function readTemplate(root: string): string {
  const template = TEMPLATE_PATTERN.exec(readText(root, TEMPLATE_FILE))
  if (template?.[1]) {
    return template[1]
  }
  throw new Error(`Prompt não encontrado em ${TEMPLATE_FILE}`)
}

function readStandard(root: string, name: string): string {
  const file = `${STANDARDS_DIRECTORY}/${name}`
  return `### ${file}\n\n${readText(root, file)}`
}

function readStandards(root: string): string {
  const standards: string[] = []
  for (const name of readdirSync(join(root, STANDARDS_DIRECTORY)).sort()) {
    if (name.endsWith(MARKDOWN_EXTENSION)) {
      standards.push(readStandard(root, name))
    }
  }
  return standards.join(STANDARD_BREAK)
}

export function loadContext(root: string): PromptContext {
  return {
    template: readTemplate(root),
    architecture: readText(root, ARCHITECTURE_FILE),
    rules: readText(root, RULES_FILE),
    standards: readStandards(root),
  }
}
