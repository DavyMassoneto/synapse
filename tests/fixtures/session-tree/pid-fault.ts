import { TREE_PROBE_ERROR } from "./constants"

export class TreePidFault extends Error {
  readonly code: string

  constructor(code: string) {
    super(TREE_PROBE_ERROR)
    this.code = code
  }

  throwFailure(): never {
    throw this
  }
}
