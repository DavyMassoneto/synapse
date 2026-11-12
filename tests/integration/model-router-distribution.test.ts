import { Value } from "typebox/value"
import { describe, expect, test } from "vitest"
import { PI_ROUTER_VIRTUAL_ID, PI_ROUTER_VIRTUAL_PROVIDER } from "#synapse/integration"
import { ROUTER_UNAVAILABLE_REASON } from "#synapse/modules"
import {
  PI_PROCESS_MODEL,
  PI_PROCESS_PROVIDER,
  PI_PROCESS_TIMEOUT_MS,
  type PiProcessScenarioHandle,
  ROUTER_TEST_AVAILABLE_MODELS_COMMAND,
  ROUTER_TEST_FALLBACK,
  ROUTER_TEST_LAST_TEXT_COMMAND,
  ROUTER_TEST_MODELS_RESPONSE,
  ROUTER_TEST_PROVIDER,
  ROUTER_TEST_REPLY,
  ROUTER_TEST_TEXT_RESPONSE,
  readPiProcessRequests,
  resolvePiProcessEntrypoint,
  runPiRouterScenario,
  runWithPiProcess,
} from "../fixtures"

async function listsVirtualRouter(piProcess: PiProcessScenarioHandle): Promise<void> {
  piProcess.start(resolvePiProcessEntrypoint())
  const response = await piProcess.command({ type: ROUTER_TEST_AVAILABLE_MODELS_COMMAND })
  expect(response.record.success).toBe(true)
  expect(Value.Parse(ROUTER_TEST_MODELS_RESPONSE, JSON.parse(response.line)).data.models).toContainEqual(
    expect.objectContaining({ provider: PI_ROUTER_VIRTUAL_PROVIDER, id: PI_ROUTER_VIRTUAL_ID }),
  )
}

async function usesPhysicalFallback(piProcess: PiProcessScenarioHandle): Promise<void> {
  await runPiRouterScenario(piProcess, {
    provider: ROUTER_TEST_PROVIDER,
    model: ROUTER_TEST_FALLBACK,
    startupModel: `${PI_ROUTER_VIRTUAL_PROVIDER}/${PI_ROUTER_VIRTUAL_ID}`,
  })
  const response = await piProcess.command({ type: ROUTER_TEST_LAST_TEXT_COMMAND })
  expect(Value.Parse(ROUTER_TEST_TEXT_RESPONSE, JSON.parse(response.line)).data.text).toBe(ROUTER_TEST_REPLY)
  expect(readPiProcessRequests(piProcess.homeDirectory.home)).toHaveLength(1)
}

async function refusesMissingFallback(piProcess: PiProcessScenarioHandle): Promise<void> {
  await runPiRouterScenario(piProcess, {
    provider: PI_PROCESS_PROVIDER,
    model: PI_PROCESS_MODEL,
    startupModel: `${PI_ROUTER_VIRTUAL_PROVIDER}/${PI_ROUTER_VIRTUAL_ID}`,
  })
  expect(readPiProcessRequests(piProcess.homeDirectory.home)).toHaveLength(0)
  expect(piProcess.received.records()).toContainEqual(
    expect.objectContaining({
      type: "message_end",
      message: expect.objectContaining({ stopReason: "error", errorMessage: ROUTER_UNAVAILABLE_REASON }),
    }),
  )
}

function registerTests(): void {
  test(
    "pacote lista o modelo virtual jev/auto",
    runWithPiProcess.bind(undefined, listsVirtualRouter),
    PI_PROCESS_TIMEOUT_MS,
  )
  test(
    "classificador ausente usa um pedido ao fallback físico",
    runWithPiProcess.bind(undefined, usesPhysicalFallback),
    PI_PROCESS_TIMEOUT_MS,
  )
  test(
    "fallback ausente recusa o pedido sem acessar o provedor",
    runWithPiProcess.bind(undefined, refusesMissingFallback),
    PI_PROCESS_TIMEOUT_MS,
  )
}

describe("distribuição do roteador de modelos", registerTests)
