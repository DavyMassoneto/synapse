import { JSON_SYNTAX_ERROR } from "./constants"

export class IphoneSimctlSyntaxError extends Error {
  constructor() {
    super(JSON_SYNTAX_ERROR)
  }
}
