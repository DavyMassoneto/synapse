import { type ShellAdmission } from "./admission"
import { SHELL_STOP_FAILED, SHELL_STOP_SUCCEEDED } from "./constants"
import { type ShellStopOutcome } from "./types"

export async function stopShellAdmission(admission: ShellAdmission): Promise<ShellStopOutcome> {
  try {
    await admission.stop()
    return { kind: SHELL_STOP_SUCCEEDED }
  } catch (error) {
    if (error instanceof Error) {
      return { kind: SHELL_STOP_FAILED, error }
    }
    throw error
  }
}
