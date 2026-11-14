import { type MemberExecutionSettled } from "#synapse/modules"
import { type TeamMemberExtensionLifetime } from "../extension-lifecycle"

export function applyTeamMemberExtensionFailure(
  settled: MemberExecutionSettled,
  lifetime: TeamMemberExtensionLifetime,
): void {
  try {
    lifetime.ensureHealthy()
  } catch (error) {
    if (!(error instanceof Error)) {
      throw error
    }
    settled.failure = error.message
  }
}
