import { ParseError, Value } from "typebox/value"
import { ModelError } from "#synapse/errors"
import { LIST_SEPARATOR } from "#synapse/separators"
import { fillTemplate } from "#synapse/templates"
import {
  ERROR_DETAIL_SEPARATOR,
  ERROR_INVALID_REPLY,
  ERROR_MISSING_COVERAGE,
  ERROR_NO_JSON,
  ERROR_UNKNOWN_RULE,
  JSON_OBJECT,
} from "./constants"
import { ReplySchema } from "./schemas"
import { type Reply } from "./types"

export function parseReply(text: string): Reply {
  const json = JSON_OBJECT.exec(text)?.at(0)
  if (json === undefined) {
    throw new ModelError(ERROR_NO_JSON)
  }
  try {
    return Value.Parse(ReplySchema, JSON.parse(json))
  } catch (error) {
    if (!(error instanceof Error)) {
      throw error
    }
    let reason = error.message
    if (error instanceof ParseError) {
      reason = error.cause.errors
        .map((failure) => failure.instancePath + ERROR_DETAIL_SEPARATOR + failure.message)
        .join(LIST_SEPARATOR)
    }
    throw new ModelError(fillTemplate(ERROR_INVALID_REPLY, [reason]), { cause: error })
  }
}

export function validateReply(reply: Reply, ruleIds: string[]): void {
  const missing = ruleIds.filter((id) => !reply.coverage.includes(id))
  if (missing.length > 0) {
    throw new ModelError(fillTemplate(ERROR_MISSING_COVERAGE, [missing.join(LIST_SEPARATOR)]))
  }
  const findingWithUnknownRule = reply.findings.find((finding) => !ruleIds.includes(finding.rule))
  if (findingWithUnknownRule !== undefined) {
    throw new ModelError(fillTemplate(ERROR_UNKNOWN_RULE, [findingWithUnknownRule.rule]))
  }
}
