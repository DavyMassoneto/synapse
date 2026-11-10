import { STANDARDS_DIRECTORY } from "./constants"
import { readText } from "./read-text"

export function formatStandard(root: string, name: string): string {
  return `### ${STANDARDS_DIRECTORY}/${name}\n\n${readText(root, `${STANDARDS_DIRECTORY}/${name}`)}`
}
