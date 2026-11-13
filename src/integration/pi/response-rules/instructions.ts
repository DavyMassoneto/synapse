import { readFileSync } from "node:fs"
import { RESPONSE_RULES_ABSENT, RESPONSE_RULES_FOUND } from "./constants"
import { isResponseRulesMissingFile } from "./predicates"
import { type ResponseRulesTextResult } from "./types"

export class ResponseRulesInstructions {
  private readonly path: string

  constructor(path: string) {
    this.path = path
  }

  readCurrent(): ResponseRulesTextResult {
    try {
      return { kind: RESPONSE_RULES_FOUND, text: new TextDecoder().decode(readFileSync(this.path)) }
    } catch (error) {
      if (error instanceof Error && isResponseRulesMissingFile(error)) {
        return { kind: RESPONSE_RULES_ABSENT }
      }
      throw error
    }
  }
}
