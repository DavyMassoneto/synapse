import { ARCHITECTURE_FILE, RULES_FILE, TEMPLATE_FILE } from "./constants"
import { extractTemplate } from "./extract-template"
import { readStandards } from "./read-standards"
import { readText } from "./read-text"
import { type PromptContext } from "./types"

export function loadContext(root: string): PromptContext {
  return {
    template: extractTemplate(readText(root, TEMPLATE_FILE)),
    architecture: readText(root, ARCHITECTURE_FILE),
    rules: readText(root, RULES_FILE),
    standards: readStandards(root),
  }
}
