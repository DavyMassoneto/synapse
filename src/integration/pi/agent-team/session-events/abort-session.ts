import { captureShellCleanup, finishShellCleanups } from "#synapse/modules/agent-team/public/supervised-shell"
import { type TeamMemberExtensionLifetime } from "../extension-lifecycle"
import { TEAM_PI_ABORT_FAILURE } from "./constants"
import { type TeamMemberSessionPort } from "./types"

export async function abortMemberSession(
  session: TeamMemberSessionPort,
  lifetime: TeamMemberExtensionLifetime,
): Promise<void> {
  const attempts = [captureShellCleanup(session.abort.bind(session))]
  if (lifetime.stopShells) {
    attempts.push(captureShellCleanup(lifetime.stopShells.bind(lifetime)))
  }
  await finishShellCleanups(attempts, TEAM_PI_ABORT_FAILURE)
}
