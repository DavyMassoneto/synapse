import { type Finding } from "../review"
import { LOCATION_SEPARATOR } from "./constants"
import { type LineGroup } from "./types"

export function groupByLine(findings: Finding[]): LineGroup[] {
  const groups = new Map<string, LineGroup>()
  for (const finding of findings) {
    const key = [finding.path, String(finding.line)].join(LOCATION_SEPARATOR)
    const group = groups.get(key)
    if (group === undefined) {
      groups.set(key, { path: finding.path, line: finding.line, findings: [finding] })
    } else {
      group.findings.push(finding)
    }
  }
  return [...groups.values()]
}
