import { findingKey } from "./finding-key"
import { type Finding } from "./types"

export function excludeKnown(candidates: Finding[], known: Finding[]): Finding[] {
  const seen = new Set<string>(known.map((finding) => findingKey(finding)))
  const fresh: Finding[] = []
  for (const candidate of candidates) {
    const key = findingKey(candidate)
    if (!seen.has(key)) {
      seen.add(key)
      fresh.push(candidate)
    }
  }
  return fresh
}
