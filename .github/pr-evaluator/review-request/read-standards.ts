import { readdirSync } from "node:fs"
import { join } from "node:path"
import { MARKDOWN_EXTENSION, STANDARDS_DIRECTORY } from "./constants"
import { readText } from "./read-text"

export function readStandards(root: string): string {
  return readdirSync(join(root, STANDARDS_DIRECTORY))
    .filter((name) => name.endsWith(MARKDOWN_EXTENSION))
    .sort()
    .map((name) => `### ${STANDARDS_DIRECTORY}/${name}\n\n${readText(root, `${STANDARDS_DIRECTORY}/${name}`)}`)
    .join("\n\n")
}
