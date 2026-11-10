import { type Placeholder, type PlaceholderTexts } from "./types"

export function isPlaceholder(texts: PlaceholderTexts, marker: string): marker is Placeholder {
  return Object.hasOwn(texts, marker)
}
