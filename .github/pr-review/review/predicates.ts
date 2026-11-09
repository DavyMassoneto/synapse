import { ModelError } from "../errors"

export function isModelError(error: Error): boolean {
  return error instanceof ModelError
}
