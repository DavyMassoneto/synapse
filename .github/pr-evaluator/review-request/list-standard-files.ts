import { readdirSync } from "node:fs"
import { join } from "node:path"
import { MARKDOWN_EXTENSION, STANDARDS_DIRECTORY } from "./constants"

export function listStandardFiles(root: string): string[] {
  return readdirSync(join(root, STANDARDS_DIRECTORY))
    .filter((name) => name.endsWith(MARKDOWN_EXTENSION))
    .sort()
}
