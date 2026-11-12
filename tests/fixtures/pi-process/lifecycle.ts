import { PiProcess } from "./pi-process"
import { type PiProcessScenario } from "./types"

export async function runWithPiProcess(scenario: PiProcessScenario): Promise<void> {
  const piProcess = new PiProcess()
  try {
    await scenario(piProcess)
  } finally {
    await piProcess.dispose()
  }
}
