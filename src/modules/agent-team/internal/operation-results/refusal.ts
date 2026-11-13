import {
  TEAM_OPERATION_FAILED,
  TEAM_REFUSED,
  type TeamFailed,
  type TeamRefused,
} from "#synapse/modules/agent-team/public/contracts"
import { TeamRuleError } from "./rule-error"
import { type TeamAsyncOperation, type TeamOperation, type TeamOperationOutcome } from "./types"

export function teamOperationResult<Result>(operation: TeamOperation<Result>): TeamOperationOutcome<Result> {
  try {
    return operation()
  } catch (error) {
    if (error instanceof TeamRuleError) {
      return teamRefusal(error)
    }
    if (error instanceof Error) {
      return teamFailure(error)
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
    if (error instanceof TeamRuleError) {
      return teamRefusal(error)
    }
    if (error instanceof Error) {
      return teamFailure(error)
    }
    throw error
  }
}

export function teamRefusal(error: Error): TeamRefused {
  return { kind: TEAM_REFUSED, message: error.message }
}

export function teamFailure(error: Error): TeamFailed {
  return { kind: TEAM_OPERATION_FAILED, message: error.message }
}
