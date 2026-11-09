import { FINDING_KEY_SEPARATOR } from "./constants"
import { type Finding } from "./types"

export function findingKey(finding: Finding): string {
  return [finding.rule, finding.path, String(finding.line)].join(FINDING_KEY_SEPARATOR)
}
