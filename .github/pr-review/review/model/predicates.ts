import { ModelError } from "#synapse/errors"

export function isModelError(error: Error): boolean {
  return error instanceof ModelError
}
