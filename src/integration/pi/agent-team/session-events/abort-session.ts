import { type TeamMemberExtensionLifetime } from "../extension-lifecycle"
import { TEAM_PI_ABORT_FAILED, TEAM_PI_ABORT_FAILURE, TEAM_PI_ABORT_SUCCEEDED } from "./constants"
import { type MemberAbortOutcome, type TeamMemberSessionPort } from "./types"

export async function abortMemberSession(
  session: TeamMemberSessionPort,
  lifetime: TeamMemberExtensionLifetime,
): Promise<void> {
  const shell = stopMemberShell(lifetime)
  const sdk = abortMemberSdk(session)
  const results = await Promise.all([shell, sdk])
  const failures: Error[] = []
  for (const result of results) {
    if (result.kind === TEAM_PI_ABORT_FAILED) {
      failures.push(result.error)
    }
  }
  if (failures.length > 0) {
    throw new AggregateError(failures, TEAM_PI_ABORT_FAILURE)
  }
}

async function stopMemberShell(lifetime: TeamMemberExtensionLifetime): Promise<MemberAbortOutcome> {
  try {
    await lifetime.stopShells?.()
    return { kind: TEAM_PI_ABORT_SUCCEEDED }
  } catch (error) {
    if (error instanceof Error) {
      return { kind: TEAM_PI_ABORT_FAILED, error }
    }
    throw error
  }
}

async function abortMemberSdk(session: TeamMemberSessionPort): Promise<MemberAbortOutcome> {
  try {
    await session.abort()
    return { kind: TEAM_PI_ABORT_SUCCEEDED }
  } catch (error) {
    if (error instanceof Error) {
      return { kind: TEAM_PI_ABORT_FAILED, error }
    }
    throw error
  }
}
