import { type SavedVariable } from "./types"

export function saveVariable(name: string): SavedVariable {
  const value = process.env[name]
  if (typeof value === "string") {
    return { kind: "set", value }
  }
  return { kind: "unset" }
}

export function restoreVariable(name: string, saved: SavedVariable): void {
  if (saved.kind === "set") {
    process.env[name] = saved.value
  } else {
    delete process.env[name]
  }
}
