import { describe, expect, test } from "vitest"
import {
  PI_COMPUTER_TOOL_DESCRIPTION,
  PI_COMPUTER_TOOL_GUIDELINES,
  PI_COMPUTER_TOOL_SNIPPET,
  type PiComputerInput,
  type PiComputerToolContext,
  PiComputerToolHandler,
  type PiComputerToolOutput,
} from "#synapse/integration/pi/computer-use"
import {
  type ComputerAction,
  type ComputerUse,
  type ComputerWaitPort,
  createComputerUse,
} from "#synapse/modules/computer-use"

const BACKGROUND_POLICY_SESSION = "background-policy-test"

const BACKGROUND_POLICY_MISSING_DRIVER = "C:/synapse-background-policy-missing-cua-driver.exe"

const BACKGROUND_POLICY_MESSAGE = "somente em segundo plano"

const BACKGROUND_POLICY_OLD_INSTRUCTION = "siga o veredito para escalar a coordenadas ou ao primeiro plano"

class BackgroundPolicyWait implements ComputerWaitPort {
  async wait(_milliseconds: number): Promise<void> {}
}

function backgroundPolicyContext(): PiComputerToolContext {
  return { sessionManager: { getSessionId: () => BACKGROUND_POLICY_SESSION } }
}

function backgroundPolicyComputer(): ComputerUse {
  return createComputerUse({
    platform: "win32",
    installationDirectory: "unused",
    captureDirectory: "unused",
    environment: {},
    wait: new BackgroundPolicyWait(),
    driverPath: BACKGROUND_POLICY_MISSING_DRIVER,
  })
}

async function executeBackgroundPolicy(input: PiComputerInput): Promise<PiComputerToolOutput> {
  const computer = backgroundPolicyComputer()
  try {
    const handler = new PiComputerToolHandler(computer)
    const output: PiComputerToolOutput = await handler.execute(
      "call",
      input,
      undefined,
      undefined,
      backgroundPolicyContext(),
    )
    return output
  } finally {
    await computer.stop()
  }
}

function expectRefusedBeforeDriver(output: PiComputerToolOutput, action: ComputerAction["action"]): void {
  expect(output.isError).toBe(true)
  expect(output.details?.result).toMatchObject({
    kind: "computer-executed",
    result: { kind: "refused", action },
    verdict: { decision: "stop", retryAllowed: false },
  })
  expect(JSON.stringify(output.content)).toContain(BACKGROUND_POLICY_MESSAGE)
  expect(JSON.stringify(output.content)).not.toContain(BACKGROUND_POLICY_MISSING_DRIVER)
}

async function refusesForegroundDelivery(): Promise<void> {
  const output = await executeBackgroundPolicy({
    action: "click",
    element: 1,
    delivery_mode: "foreground",
  })
  expectRefusedBeforeDriver(output, "click")
}

async function refusesBringToFront(): Promise<void> {
  const output = await executeBackgroundPolicy({
    action: "click",
    element: 1,
    bring_to_front: true,
  })
  expectRefusedBeforeDriver(output, "click")
}

async function refusesRaiseWindow(): Promise<void> {
  const output = await executeBackgroundPolicy({
    action: "focus_app",
    app: "Editor",
    raise_window: true,
  })
  expectRefusedBeforeDriver(output, "focus_app")
}

async function acceptsBackgroundDelivery(): Promise<void> {
  const output = await executeBackgroundPolicy({
    action: "click",
    element: 1,
    delivery_mode: "background",
  })
  expect(output.details?.result).toMatchObject({ result: { kind: "failed" } })
  expect(JSON.stringify(output.content)).not.toContain(BACKGROUND_POLICY_MESSAGE)
}

async function acceptsFocusSelectionWithoutRaise(): Promise<void> {
  const output = await executeBackgroundPolicy({ action: "focus_app", app: "Editor" })
  expect(output.details?.result).toMatchObject({ result: { kind: "failed" } })
  expect(JSON.stringify(output.content)).not.toContain(BACKGROUND_POLICY_MESSAGE)
}

function instructionsDoNotEscalateToForeground(): void {
  const instructions = [PI_COMPUTER_TOOL_DESCRIPTION, PI_COMPUTER_TOOL_SNIPPET, ...PI_COMPUTER_TOOL_GUIDELINES]
  const text = instructions.join(" ")
  expect(text).toContain(BACKGROUND_POLICY_MESSAGE)
  expect(text).toContain("bridge")
  expect(text).not.toContain(BACKGROUND_POLICY_OLD_INSTRUCTION)
  expect(text).toContain("Fechar")
}

function register(): void {
  test("recusa entrega em primeiro plano antes do driver", refusesForegroundDelivery)
  test("recusa trazer à frente antes do driver", refusesBringToFront)
  test("recusa elevar janela antes do driver", refusesRaiseWindow)
  test("aceita entrega em segundo plano", acceptsBackgroundDelivery)
  test("aceita seleção de alvo sem elevar", acceptsFocusSelectionWithoutRaise)
  test("instruções não escalam para primeiro plano", instructionsDoNotEscalateToForeground)
}

describe("política somente segundo plano na ferramenta computer_use", register)
