import { describe, expect, test } from "vitest"
import { PI_ROUTER_VIRTUAL_ID, PI_ROUTER_VIRTUAL_PROVIDER } from "#synapse/integration"
import { ROUTER_UNAVAILABLE_REASON } from "#synapse/modules"
import {
  PI_PROCESS_TIMEOUT_MS,
  type PiProcessScenarioHandle,
  ROUTER_TEST_AVAILABLE_MODELS_COMMAND,
  ROUTER_TEST_ERROR,
  ROUTER_TEST_FALLBACK,
  ROUTER_TEST_LAST_TEXT_COMMAND,
  ROUTER_TEST_MESSAGE_END,
  ROUTER_TEST_PROVIDER,
  ROUTER_TEST_REPLY,
  readPiProcessRequests,
  resolvePiProcessEntrypoint,
  runPiRouterScenario,
  runWithPiProcess,
  SCRIPTED_PROVIDER_MODEL,
  SCRIPTED_PROVIDER_PROVIDER,
} from "../fixtures"

async function listsVirtualRouter(piProcess: PiProcessScenarioHandle): Promise<void> {
  piProcess.start(resolvePiProcessEntrypoint())
  const response = await piProcess.query(ROUTER_TEST_AVAILABLE_MODELS_COMMAND)
  expect(response.success).toBe(true)
  expect(response.data.models).toContainEqual(
    expect.objectContaining({ provider: PI_ROUTER_VIRTUAL_PROVIDER, id: PI_ROUTER_VIRTUAL_ID }),
  )
}

async function usesPhysicalFallback(piProcess: PiProcessScenarioHandle): Promise<void> {
  await runPiRouterScenario(piProcess, {
    provider: ROUTER_TEST_PROVIDER,
    model: ROUTER_TEST_FALLBACK,
    startupModel: `${PI_ROUTER_VIRTUAL_PROVIDER}/${PI_ROUTER_VIRTUAL_ID}`,
  })
  const response = await piProcess.query(ROUTER_TEST_LAST_TEXT_COMMAND)
  expect(response.data.text).toBe(ROUTER_TEST_REPLY)
  expect(readPiProcessRequests(piProcess.homeDirectory.home)).toHaveLength(1)
}

async function refusesMissingFallback(piProcess: PiProcessScenarioHandle): Promise<void> {
  await runPiRouterScenario(piProcess, {
    provider: SCRIPTED_PROVIDER_PROVIDER,
    model: SCRIPTED_PROVIDER_MODEL,
    startupModel: `${PI_ROUTER_VIRTUAL_PROVIDER}/${PI_ROUTER_VIRTUAL_ID}`,
  })
  expect(readPiProcessRequests(piProcess.homeDirectory.home)).toHaveLength(0)
  expect(piProcess.received.records()).toContainEqual(
    expect.objectContaining({
      type: ROUTER_TEST_MESSAGE_END,
      message: expect.objectContaining({ stopReason: ROUTER_TEST_ERROR, errorMessage: ROUTER_UNAVAILABLE_REASON }),
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
