import { SELECTION_ACQUISITION_FAILURE } from "./constants"
import { type SelectionCleanupAction, type SelectionCleanupFailures, type SelectionSessionCleanup } from "./types"

async function attemptSelectionCleanup(
  action: SelectionCleanupAction,
  failures: SelectionCleanupFailures,
): Promise<void> {
  try {
    await action()
  } catch (error) {
    if (error instanceof Error || typeof error === "string") {
      failures.push(error)
    } else {
      failures.push(new Error(SELECTION_ACQUISITION_FAILURE, { cause: error }))
    }
  }
}

export async function releaseSelectionSession(cleanup: SelectionSessionCleanup): Promise<void> {
  const failures: SelectionCleanupFailures = []
  if (cleanup.team) {
    await attemptSelectionCleanup(cleanup.team.suspend.bind(cleanup.team), failures)
  }
  if (cleanup.session) {
    await attemptSelectionCleanup(cleanup.session.dispose.bind(cleanup.session), failures)
  }
  await attemptSelectionCleanup(cleanup.releaseDirectory, failures)
  if (failures.length === 1) {
    throw failures[0]
  }
  if (failures.length > 1) {
    throw new AggregateError(failures, SELECTION_ACQUISITION_FAILURE)
  }
}
