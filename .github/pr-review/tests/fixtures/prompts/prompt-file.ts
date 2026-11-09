import { readFileSync } from "node:fs"
import { TEXT_ENCODING } from "#synapse/separators"

export function promptFile(name: string): string {
  return readFileSync(new URL(`../../../prompts/${name}.md`, import.meta.url), TEXT_ENCODING)
}
