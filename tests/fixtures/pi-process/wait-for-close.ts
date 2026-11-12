import { type ChildProcessWithoutNullStreams } from "node:child_process"
import { once } from "node:events"
import { PI_PROCESS_CLOSE_EVENT, PI_PROCESS_SHUTDOWN_TIMEOUT_MS } from "./constants"

export async function waitForPiProcessClose(child: ChildProcessWithoutNullStreams): Promise<void> {
  await once(child, PI_PROCESS_CLOSE_EVENT, { signal: AbortSignal.timeout(PI_PROCESS_SHUTDOWN_TIMEOUT_MS) })
}
