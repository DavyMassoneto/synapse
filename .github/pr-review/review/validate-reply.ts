import { ModelError } from "../errors"
import { LIST_SEPARATOR } from "../separators"
import { fillTemplate } from "../templates"
import { ERROR_MISSING_COVERAGE, ERROR_UNKNOWN_RULE } from "./constants"
import { type Reply } from "./types"

export function validateReply(reply: Reply, ruleIds: string[]): void {
  const missing = ruleIds.filter((id) => !reply.coverage.includes(id))
  if (missing.length > 0) {
    throw new ModelError(fillTemplate(ERROR_MISSING_COVERAGE, [missing.join(LIST_SEPARATOR)]))
  }
  const unknown = reply.findings.find((finding) => !ruleIds.includes(finding.rule))
  if (unknown !== undefined) {
    throw new ModelError(fillTemplate(ERROR_UNKNOWN_RULE, [unknown.rule]))
  }
}
