import { TEMPLATE_FENCE_CLOSE, TEMPLATE_FENCE_OPEN, TEMPLATE_FILE } from "./constants"

export function extractTemplate(document: string): string {
  const open = document.indexOf(TEMPLATE_FENCE_OPEN)
  const close = document.indexOf(TEMPLATE_FENCE_CLOSE, open + TEMPLATE_FENCE_OPEN.length)
  if (open === -1 || close === -1) {
    throw new Error(`Prompt não encontrado em ${TEMPLATE_FILE}`)
  }
  return document.slice(open + TEMPLATE_FENCE_OPEN.length, close)
}
