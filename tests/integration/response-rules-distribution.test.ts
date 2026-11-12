import { describe, expect, test } from "vitest"
import {
  PI_PROCESS_RULES,
  PI_PROCESS_TIMEOUT_MS,
  PI_PROCESS_UNRELATED_RULES,
  type PiProcessScenarioHandle,
  piProcessResponseRulesMessage,
  RESPONSE_INTEGRATION_REMINDER,
  RESPONSE_RULES_TEST_PROMPT,
  runWithPiProcess,
} from "../fixtures"

async function appendsResponseRules(piProcess: PiProcessScenarioHandle): Promise<void> {
  expect(await piProcessResponseRulesMessage(piProcess, PI_PROCESS_RULES)).toBe(
    `${RESPONSE_RULES_TEST_PROMPT}${RESPONSE_INTEGRATION_REMINDER}`,
  )
}

async function ignoresOtherSections(piProcess: PiProcessScenarioHandle): Promise<void> {
  expect(await piProcessResponseRulesMessage(piProcess, PI_PROCESS_UNRELATED_RULES)).toBe(RESPONSE_RULES_TEST_PROMPT)
}

function registerTests(): void {
  test(
    "seção Respostas chega ao modelo como lembrete final",
    runWithPiProcess.bind(undefined, appendsResponseRules),
    PI_PROCESS_TIMEOUT_MS,
  )
  test(
    "seção diferente é ignorada sem acrescentar lembrete",
    runWithPiProcess.bind(undefined, ignoresOtherSections),
    PI_PROCESS_TIMEOUT_MS,
  )
}

describe("distribuição das regras de resposta", registerTests)
