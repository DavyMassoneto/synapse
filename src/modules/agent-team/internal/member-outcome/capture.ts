import { MEMBER_OUTCOME_FAILED } from "./constants"
import { type MemberOutcome, type MemberOutcomeAction } from "./types"

export async function captureMemberOutcome(action: MemberOutcomeAction): Promise<MemberOutcome> {
  try {
    if (typeof action === "function") {
      await action()
    } else {
      await action
    }
    return { failed: false }
  } catch (failure) {
    if (failure instanceof Error) {
      return { failed: true, error: failure }
    }
    if (typeof failure === "string") {
      return { failed: true, error: new Error(failure) }
    }
    return { failed: true, error: new Error(MEMBER_OUTCOME_FAILED) }
  }
}

export async function finishMemberOutcomes(attempts: Promise<MemberOutcome>[], message: string): Promise<void> {
  const failures: Error[] = []
  for (const result of await Promise.all(attempts)) {
    if (result.failed) {
      failures.push(result.error)
    }
  }
  if (failures.length > 0) {
    throw new AggregateError(failures, message)
  }
}
