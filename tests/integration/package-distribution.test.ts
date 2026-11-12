import { existsSync } from "node:fs"
import { join } from "node:path"
import { describe, expect, test } from "vitest"
import {
  ADVISOR_PROMPT,
  INVALID_CASES,
  type InvalidConfigCase,
  PI_PROCESS_COMMAND_TIMEOUT_MS,
  PI_PROCESS_COMMANDS_RESPONSE_MISSING,
  PI_PROCESS_LOADING_ERROR,
  PI_PROCESS_MISSING_ENTRY,
  PI_PROCESS_NOTICE_METHOD,
  PI_PROCESS_STATUS_METHOD,
  PI_PROCESS_TIMEOUT_MS,
  type PiProcessScenarioHandle,
  packageAdvisorPath,
  readPackageAdvisorConfig,
  requirePiProcessRequest,
  resolvePiProcessEntrypoint,
  runPiProcessPrompt,
  runWithPiProcess,
  SCRIPTED_PROVIDER_MODEL_REFERENCE,
  VALID_CONFIG,
  writePackageAdvisorConfig,
} from "../fixtures"

async function registersPackagedAdvisor(piProcess: PiProcessScenarioHandle): Promise<void> {
  piProcess.start(resolvePiProcessEntrypoint())
  const response = await piProcess.command({ type: "get_commands" })
  if (!("success" in response) || !("data" in response)) {
    throw new Error(PI_PROCESS_COMMANDS_RESPONSE_MISSING)
  }
  expect(response.success).toBe(true)
  expect(response.data.commands).toContainEqual(expect.objectContaining({ name: "advisor", source: "extension" }))
  expect(piProcess.stderr).not.toMatch(PI_PROCESS_LOADING_ERROR)
}

async function disablesMissingConfiguration(piProcess: PiProcessScenarioHandle): Promise<void> {
  piProcess.start(resolvePiProcessEntrypoint())
  const status = await piProcess.received.waitForUi(PI_PROCESS_STATUS_METHOD, PI_PROCESS_COMMAND_TIMEOUT_MS)
  expect(status.statusText).toBeUndefined()
  expect(existsSync(packageAdvisorPath(piProcess.homeDirectory.agentDirectory))).toBe(false)
}

async function readsValidConfiguration(piProcess: PiProcessScenarioHandle): Promise<void> {
  writePackageAdvisorConfig(piProcess, VALID_CONFIG)
  piProcess.start(resolvePiProcessEntrypoint())
  const status = await piProcess.received.waitForUi(PI_PROCESS_STATUS_METHOD, PI_PROCESS_COMMAND_TIMEOUT_MS)
  expect(status.statusText).toBe(`advisor: ${SCRIPTED_PROVIDER_MODEL_REFERENCE}`)
  expect(readPackageAdvisorConfig(piProcess)).toBe(VALID_CONFIG)
}

async function rejectsInvalidConfiguration(
  input: InvalidConfigCase,
  piProcess: PiProcessScenarioHandle,
): Promise<void> {
  writePackageAdvisorConfig(piProcess, input.content)
  piProcess.start(resolvePiProcessEntrypoint())
  const notice = await piProcess.received.waitForUi(PI_PROCESS_NOTICE_METHOD, PI_PROCESS_COMMAND_TIMEOUT_MS)
  expect(notice.notifyType).toBe("error")
  expect(notice.message).toMatch(/inválida/)
  expect(readPackageAdvisorConfig(piProcess)).toBe(input.content)
}

async function refusesMissingEntrypoint(piProcess: PiProcessScenarioHandle): Promise<void> {
  piProcess.start(join(piProcess.homeDirectory.home, PI_PROCESS_MISSING_ENTRY))
  await expect(piProcess.command({ type: "get_commands" })).rejects.toThrow(/extensão|extension/i)
  expect(piProcess.stderr).toContain(PI_PROCESS_MISSING_ENTRY)
}

async function consultsConfiguredAdvisor(piProcess: PiProcessScenarioHandle): Promise<void> {
  writePackageAdvisorConfig(piProcess, VALID_CONFIG)
  piProcess.homeDirectory.script([
    { kind: "toolCall", name: "advisor", argumentsJson: "{}" },
    { kind: "text", text: "conselho" },
    { kind: "text", text: "concluído" },
  ])
  const requests = await runPiProcessPrompt(piProcess, ADVISOR_PROMPT)
  expect(requests).toHaveLength(3)
  expect(JSON.stringify(requirePiProcessRequest(requests, 2))).toContain("conselho")
}

async function runInvalidConfiguration(input: InvalidConfigCase): Promise<void> {
  await runWithPiProcess(rejectsInvalidConfiguration.bind(undefined, input))
}

async function refusesSecondStart(piProcess: PiProcessScenarioHandle): Promise<void> {
  piProcess.start(resolvePiProcessEntrypoint())
  expect(piProcess.start.bind(piProcess, resolvePiProcessEntrypoint())).toThrow(/já iniciado/)
}

function registerTests(): void {
  test(
    "recusa iniciar o mesmo processo duas vezes",
    runWithPiProcess.bind(undefined, refusesSecondStart),
    PI_PROCESS_TIMEOUT_MS,
  )
  test(
    "consulta advisor configurado pelo modelo roteirizado",
    runWithPiProcess.bind(undefined, consultsConfiguredAdvisor),
    PI_PROCESS_TIMEOUT_MS,
  )
  test(
    "executável público carrega o pacote e registra advisor",
    runWithPiProcess.bind(undefined, registersPackagedAdvisor),
    PI_PROCESS_TIMEOUT_MS,
  )
  test(
    "sem configuração o advisor fica desligado",
    runWithPiProcess.bind(undefined, disablesMissingConfiguration),
    PI_PROCESS_TIMEOUT_MS,
  )
  test(
    "configuração válida é lida sem alterar o arquivo",
    runWithPiProcess.bind(undefined, readsValidConfiguration),
    PI_PROCESS_TIMEOUT_MS,
  )
  test.each(INVALID_CASES)("configuração recusada: $name", runInvalidConfiguration, PI_PROCESS_TIMEOUT_MS)
  test(
    "entrada inexistente falha com diagnóstico claro",
    runWithPiProcess.bind(undefined, refusesMissingEntrypoint),
    PI_PROCESS_TIMEOUT_MS,
  )
}

describe("distribuição do pacote", registerTests)
