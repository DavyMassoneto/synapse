import { Value } from "typebox/value"
import { ModelError } from "#synapse/errors"
import { LIST_SEPARATOR } from "#synapse/separators"
import { fillTemplate } from "#synapse/templates"
import {
  ERROR_INVALID_REPLY,
  ERROR_MISSING_COVERAGE,
  ERROR_NO_JSON,
  ERROR_UNKNOWN_RULE,
  JSON_OBJECT,
} from "./constants"
import { ReplySchema, VerdictsSchema } from "./schemas"
import { type Reply, type Verdicts } from "./types"

export function parseReply(text: string): Reply {
  const json = JSON_OBJECT.exec(text)?.at(0)
  if (json === undefined) {
    throw new ModelError(ERROR_NO_JSON)
  }
  try {
    return Value.Parse(ReplySchema, JSON.parse(json))
  } catch (error) {
    throw new ModelError(fillTemplate(ERROR_INVALID_REPLY, [error instanceof Error ? error.message : text]))
  }
}

export function parseVerdicts(text: string): Verdicts {
  const json = JSON_OBJECT.exec(text)?.at(0)
  if (json === undefined) {
    throw new ModelError(ERROR_NO_JSON)
  }
  try {
    return Value.Parse(VerdictsSchema, JSON.parse(json))
  } catch (error) {
    throw new ModelError(fillTemplate(ERROR_INVALID_REPLY, [error instanceof Error ? error.message : text]))
  }
}

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
