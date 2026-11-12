import { describe, expect, test } from "vitest"
import {
  COOLDOWN_DISTRIBUTION_ERROR,
  COOLDOWN_DISTRIBUTION_PERMANENT_ERROR,
  COOLDOWN_DISTRIBUTION_PROMPT,
  COOLDOWN_DISTRIBUTION_REPLY,
  lastPiProcessUserText,
  PI_PROCESS_TIMEOUT_MS,
  type PiProcessScenarioHandle,
  requirePiProcessRequest,
  runPiProcessPrompt,
  runWithPiProcess,
  SCRIPTED_PROVIDER_ERROR_KIND,
  SCRIPTED_PROVIDER_TEXT_KIND,
} from "../fixtures"

async function retriesCooldown(piProcess: PiProcessScenarioHandle): Promise<void> {
  piProcess.homeDirectory.script([
    { kind: SCRIPTED_PROVIDER_ERROR_KIND, text: COOLDOWN_DISTRIBUTION_ERROR },
    { kind: SCRIPTED_PROVIDER_TEXT_KIND, text: COOLDOWN_DISTRIBUTION_REPLY },
  ])
  const requests = await runPiProcessPrompt(piProcess, COOLDOWN_DISTRIBUTION_PROMPT)
  const response = await piProcess.lastAssistantText()
  expect(response.data.text).toBe(COOLDOWN_DISTRIBUTION_REPLY)
  expect(requests).toHaveLength(2)
  const first = requirePiProcessRequest(requests, 0)
  const second = requirePiProcessRequest(requests, 1)
  expect(lastPiProcessUserText(second)).toBe(lastPiProcessUserText(first))
  expect(piProcess.received.records()).toContainEqual(expect.objectContaining({ type: "auto_retry_start" }))
}

async function refusesPermanentFailure(piProcess: PiProcessScenarioHandle): Promise<void> {
  piProcess.homeDirectory.script([{ kind: SCRIPTED_PROVIDER_ERROR_KIND, text: COOLDOWN_DISTRIBUTION_PERMANENT_ERROR }])
  const requests = await runPiProcessPrompt(piProcess, COOLDOWN_DISTRIBUTION_PROMPT)
  expect(requests).toHaveLength(1)
  expect(piProcess.received.records()).toContainEqual(
    expect.objectContaining({
      type: "message_end",
      message: expect.objectContaining({
        role: "assistant",
        stopReason: "error",
        errorMessage: COOLDOWN_DISTRIBUTION_PERMANENT_ERROR,
      }),
    }),
  )
  expect(piProcess.received.records()).not.toContainEqual(expect.objectContaining({ type: "auto_retry_start" }))
}

function registerTests(): void {
  test(
    "cooldown repete o pedido no pi e termina com ok",
    runWithPiProcess.bind(undefined, retriesCooldown),
    PI_PROCESS_TIMEOUT_MS,
  )
  test(
    "credencial inválida termina com erro sem repetir",
    runWithPiProcess.bind(undefined, refusesPermanentFailure),
    PI_PROCESS_TIMEOUT_MS,
  )
}

describe("distribuição da repetição por cooldown", registerTests)
