import { writeFileSync } from "node:fs"
import { join } from "node:path"
import { type PiProcessScenarioHandle } from "../pi-process"
import { computerIntegrationDriverArguments } from "./fake-driver"

export function configureComputerDistributionDriver(piProcess: PiProcessScenarioHandle): void {
  const argumentsValue = computerIntegrationDriverArguments()
  writeFileSync(
    join(piProcess.homeDirectory.agentDirectory, "computer-use-driver.json"),
    JSON.stringify({ command: process.execPath, arguments: argumentsValue }),
  )
}
