import { TEMPLATE_FILE, TEMPLATE_PATTERN } from "./constants"
import { hasTemplate } from "./predicates"

export function extractTemplate(document: string): string {
  if (hasTemplate(document)) {
    return document.replace(TEMPLATE_PATTERN, "$1")
  }
  throw new Error(`Prompt não encontrado em ${TEMPLATE_FILE}`)
}
