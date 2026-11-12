import { readFileSync, writeFileSync } from "node:fs"
import { join } from "node:path"
import { ADVISOR_CONFIG_FILE } from "#synapse/integration"
import { PI_PROCESS_ENCODING, type PiProcessScenarioHandle } from "../pi-process"

export function packageAdvisorPath(agentDirectory: string): string {
  return join(agentDirectory, ADVISOR_CONFIG_FILE)
}

export function writePackageAdvisorConfig(piProcess: PiProcessScenarioHandle, content: string): void {
  writeFileSync(packageAdvisorPath(piProcess.homeDirectory.agentDirectory), content)
}

export function readPackageAdvisorConfig(piProcess: PiProcessScenarioHandle): string {
  return readFileSync(packageAdvisorPath(piProcess.homeDirectory.agentDirectory), PI_PROCESS_ENCODING)
}
