import { readFileSync } from "node:fs"
import { TEXT_ENCODING } from "./constants"

export function readText(path: string): string {
  return readFileSync(path, { encoding: TEXT_ENCODING })
}
