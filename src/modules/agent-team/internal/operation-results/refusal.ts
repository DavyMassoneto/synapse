import { TEAM_OPERATION_FAILED, TEAM_REFUSED } from "#synapse/modules/agent-team/public/contracts"
import { TeamRuleError } from "./rule-error"
import {
  type TeamAsyncOperation,
  type TeamOperation,
  type TeamOperationError,
  type TeamOperationOutcome,
} from "./types"

export function teamOperationResult<Result>(operation: TeamOperation<Result>): TeamOperationOutcome<Result> {
  try {
    return operation()
  } catch (error) {
    if (error instanceof Error) {
      return teamClassifyError(error)
    }
    throw error
  }
}

export async function teamAsyncOperationResult<Result>(
  operation: TeamAsyncOperation<Result>,
): Promise<TeamOperationOutcome<Result>> {
  try {
    return await operation()
  } catch (error) {
    if (error instanceof Error) {
      return teamClassifyError(error)
    }
    throw error
  }
}

export function teamClassifyError(error: Error): TeamOperationError {
  if (error instanceof TeamRuleError) {
    return { kind: TEAM_REFUSED, message: error.message }
  }
  return { kind: TEAM_OPERATION_FAILED, message: error.message }
}
