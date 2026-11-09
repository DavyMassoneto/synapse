import { readFileSync } from "node:fs"
import { join } from "node:path"

export function readText(root: string, file: string): string {
  return readFileSync(join(root, file), "utf8")
}
