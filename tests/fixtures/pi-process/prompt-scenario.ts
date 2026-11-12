import { type PiProcessRequestLog, readPiProcessRequests } from "../request-log"
import { PI_PROCESS_COMMAND_TIMEOUT_MS, PI_PROCESS_PROMPT_COMMAND, PI_PROCESS_SETTLED_EVENT } from "./constants"
import { resolvePiProcessEntrypoint } from "./process-paths"
import { type PiProcessScenarioHandle } from "./types"

export async function runPiProcessPrompt(
  piProcess: PiProcessScenarioHandle,
  message: string,
): Promise<PiProcessRequestLog[]> {
  piProcess.start(resolvePiProcessEntrypoint())
  await piProcess.command({ type: PI_PROCESS_PROMPT_COMMAND, message })
  await piProcess.received.waitFor(PI_PROCESS_SETTLED_EVENT, PI_PROCESS_COMMAND_TIMEOUT_MS)
  return readPiProcessRequests(piProcess.homeDirectory.home)
}
