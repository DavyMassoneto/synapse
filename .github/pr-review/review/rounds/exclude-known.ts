import { type Finding } from "../model"
import { FINDING_KEY_SEPARATOR } from "./constants"

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

export function findingKey(finding: Finding): string {
  return [finding.rule, finding.path, String(finding.line)].join(FINDING_KEY_SEPARATOR)
}
