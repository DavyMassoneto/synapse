import { NO_TEXT } from "../separators"
import { type Delta } from "./types"

export function contentOf(delta: Delta): string {
  if (typeof delta.content === "string") {
    return delta.content
  }
  return NO_TEXT
}
