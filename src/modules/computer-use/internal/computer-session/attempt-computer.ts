import { COMPUTER_USE_FAILURE_MESSAGE } from "./constants"
import { type ComputerAttemptFailure, type ComputerAttemptOperation } from "./types"

export async function attemptComputer<T>(
  operation: ComputerAttemptOperation<T>,
  onFailure: ComputerAttemptFailure<T>,
): Promise<T> {
  try {
    return await operation()
  } catch (error) {
    if (error instanceof Error) {
      return onFailure(error.message)
    }
    return onFailure(COMPUTER_USE_FAILURE_MESSAGE)
  }
}
