import { TEAM_REFUSED } from "#synapse/modules/agent-team/public/contracts"
import { type TeamAsyncOperation, type TeamOperation, type TeamOperationOutcome } from "./types"

export function teamOperationResult<Result>(operation: TeamOperation<Result>): TeamOperationOutcome<Result> {
  try {
    return operation()
  } catch (error) {
    if (error instanceof Error) {
      return { kind: TEAM_REFUSED, message: error.message }
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
      return { kind: TEAM_REFUSED, message: error.message }
    }
    throw error
  }
}
