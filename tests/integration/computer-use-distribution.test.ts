import { describe, expect, test } from "vitest"
import {
  configureComputerDistributionDriver,
  PI_PROCESS_COMMAND_TIMEOUT_MS,
  PI_PROCESS_SETTLED_EVENT,
  PI_PROCESS_TIMEOUT_MS,
  type PiProcessScenarioHandle,
  readPiProcessRequests,
  resolvePiProcessEntrypoint,
  runWithPiProcess,
} from "../fixtures"

async function callsComputerTool(piProcess: PiProcessScenarioHandle): Promise<void> {
  configureComputerDistributionDriver(piProcess)
  piProcess.homeDirectory.script([
    { kind: "toolCall", name: "computer_use", argumentsJson: '{"action":"list_apps"}' },
    { kind: "text", text: "concluído" },
  ])
  piProcess.start(resolvePiProcessEntrypoint())
  await piProcess.command({ type: "prompt", message: "Liste os aplicativos pela ferramenta computer_use." })
  await piProcess.received.waitFor(PI_PROCESS_SETTLED_EVENT, PI_PROCESS_COMMAND_TIMEOUT_MS)
  const requests = readPiProcessRequests(piProcess.homeDirectory.home)
  expect(requests).toHaveLength(2)
  expect(JSON.stringify(requests[1])).toContain("computer-apps-listed")
  expect(JSON.stringify(requests[1])).toContain("Editor")
}

function register(): void {
  test(
    "modelo recebe resultado computer_use no segundo pedido",
    runWithPiProcess.bind(undefined, callsComputerTool),
    PI_PROCESS_TIMEOUT_MS,
  )
}

describe("distribuição computer-use", register)
