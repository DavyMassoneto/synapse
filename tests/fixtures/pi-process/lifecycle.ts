import { PiProcess } from "./pi-process"
import { PiProcessHome } from "./pi-process-home"
import { type PiProcessScenario } from "./types"

export async function runWithPiProcess(scenario: PiProcessScenario): Promise<void> {
  const piProcess = new PiProcess(new PiProcessHome())
  try {
    await scenario(piProcess)
  } finally {
    await piProcess.dispose()
  }
}
