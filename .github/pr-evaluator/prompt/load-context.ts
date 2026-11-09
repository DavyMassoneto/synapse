import { readdirSync, readFileSync } from "node:fs"
import { join } from "node:path"
import {
  ARCHITECTURE_FILE,
  MARKDOWN_EXTENSION,
  RULES_FILE,
  STANDARDS_DIRECTORY,
  TEMPLATE_FENCE_CLOSE,
  TEMPLATE_FENCE_OPEN,
  TEMPLATE_FILE,
} from "./constants"
import { type PromptContext } from "./types"

function readText(root: string, file: string): string {
  return readFileSync(join(root, file), "utf8")
}

function extractTemplate(document: string): string {
  const open = document.indexOf(TEMPLATE_FENCE_OPEN)
  const close = document.indexOf(TEMPLATE_FENCE_CLOSE, open + TEMPLATE_FENCE_OPEN.length)
  if (open === -1 || close === -1) {
    throw new Error(`Prompt não encontrado em ${TEMPLATE_FILE}`)
  }
  return document.slice(open + TEMPLATE_FENCE_OPEN.length, close)
}

function readStandards(root: string): string {
  return readdirSync(join(root, STANDARDS_DIRECTORY))
    .filter((name) => name.endsWith(MARKDOWN_EXTENSION))
    .sort()
    .map((name) => `### ${STANDARDS_DIRECTORY}/${name}\n\n${readText(root, `${STANDARDS_DIRECTORY}/${name}`)}`)
    .join("\n\n")
}

export function loadContext(root: string): PromptContext {
  return {
    template: extractTemplate(readText(root, TEMPLATE_FILE)),
    architecture: readText(root, ARCHITECTURE_FILE),
    rules: readText(root, RULES_FILE),
    standards: readStandards(root),
  }
}
