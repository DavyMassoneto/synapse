import { rmSync } from "node:fs"

export function removeTemporaryIfPossible(path: string): void {
  try {
    rmSync(path, { force: true })
  } catch {
    return
  }
}
