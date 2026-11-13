import { readFileSync, writeFileSync } from "node:fs"
import { afterEach, beforeEach, describe, expect, test } from "vitest"
import { compose } from "#synapse/composition"
import { advisorConfigPath, responseRulesInstructionsPath } from "#synapse/integration"
import {
  COOLING_DOWN_ERROR,
  DistributionEnvironment,
  failedAssistantMessage,
  REWRITE_PREFIX,
  ROUTER_TEST_VIRTUAL_ID,
  ROUTER_TEST_VIRTUAL_PROVIDER,
  responseRulesContextEvent,
  SynapseHostCollector,
  TestContext,
  toolText,
} from "../fixtures"

let environment: DistributionEnvironment
let host: SynapseHostCollector
let context: TestContext

function prepare(): void {
  environment = new DistributionEnvironment()
  host = new SynapseHostCollector()
  context = new TestContext()
}

function configureModel(): void {
  writeFileSync(advisorConfigPath(), JSON.stringify({ model: "provider/model", thinking: "low" }))
  compose(host)
}

async function registersAdvisor(): Promise<void> {
  configureModel()
  await host.emitSessionStart(context)
  expect(host.active).toContain("advisor")
  expect(host.shutdowns).toHaveLength(1)
}

async function consultsWithLiveSignal(): Promise<void> {
  configureModel()
  const answered = await host.requireTool().execute("id", {}, undefined, undefined, context)
  expect(toolText(answered)).toBe("conselho")
  expect(context.modelRegistry.options?.signal?.aborted).toBe(false)
}

async function shutdownAbortsOnce(): Promise<void> {
  configureModel()
  await host.requireTool().execute("id", {}, undefined, undefined, context)
  const lifetime = context.modelRegistry.options?.signal
  await host.emitShutdown(context)
  const reason = lifetime?.reason
  await host.emitShutdown(context)
  expect(lifetime?.aborted).toBe(true)
  expect(reason).toBeInstanceOf(Error)
  expect(lifetime?.reason).toBe(reason)
}

async function refusesAfterShutdown(): Promise<void> {
  configureModel()
  await host.emitShutdown(context)
  const refused = await host.requireTool().execute("id", {}, undefined, undefined, context)
  expect(toolText(refused)).toMatch(/cancelada/)
  expect(context.modelRegistry.calls).toBe(0)
}

async function missingConfiguration(): Promise<void> {
  compose(host)
  await host.emitSessionStart(context)
  expect(host.active).not.toContain("advisor")
  const result = await host.requireTool().execute("id", {}, undefined, undefined, context)
  expect(result.isError).toBe(true)
  expect(toolText(result)).toBe("Nenhum modelo advisor configurado.")
  expect(context.modelRegistry.calls).toBe(0)
}

async function composeInvalid(): Promise<void> {
  writeFileSync(advisorConfigPath(), "{broken")
  context.hasUI = true
  compose(host)
  await host.emitSessionStart(context)
}

async function invalidConfigurationIsReported(): Promise<void> {
  await composeInvalid()
  expect(context.ui.notices[0]).toMatch(/inválida/)
}

async function invalidConfigurationDisablesTool(): Promise<void> {
  await composeInvalid()
  expect(host.active).not.toContain("advisor")
}

async function invalidConfigurationRefusesConsultation(): Promise<void> {
  await composeInvalid()
  const result = await host.requireTool().execute("id", {}, undefined, undefined, context)
  expect(toolText(result)).toMatch(/inválida/)
  expect(context.modelRegistry.calls).toBe(0)
}

async function invalidConfigurationIsPreserved(): Promise<void> {
  await composeInvalid()
  expect(readFileSync(advisorConfigPath(), "utf8")).toBe("{broken")
}

function cleanup(): void {
  environment.restore()
}

function registersCooldownRetry(): void {
  compose(host)
  const message = failedAssistantMessage(COOLING_DOWN_ERROR)
  const results = host.messageEnds.map((handler) => handler({ type: "message_end", message }))
  expect(results).toStrictEqual([{ message: { ...message, errorMessage: `${REWRITE_PREFIX}${COOLING_DOWN_ERROR}` } }])
}

function registersResponseRules(): void {
  writeFileSync(responseRulesInstructionsPath(), "## Respostas\nSeja direto.\n")
  compose(host)
  const result = host.requireContextHandler()(responseRulesContextEvent())
  expect(result).toStrictEqual({
    messages: [
      {
        role: "user",
        content: [
          { type: "text", text: "Olá" },
          { type: "text", text: "\n\n<system-reminder>\nSeja direto.\n</system-reminder>" },
        ],
        timestamp: 0,
      },
    ],
  })
}

function ignoresMissingResponseRules(): void {
  compose(host)
  const result = host.requireContextHandler()(responseRulesContextEvent())
  expect(result).toBeUndefined()
}

function registersModelRouter(): void {
  compose(host)
  const model = host.router.requireModel()
  expect([model.provider, model.id]).toStrictEqual([ROUTER_TEST_VIRTUAL_PROVIDER, ROUTER_TEST_VIRTUAL_ID])
}

function registerTests(): void {
  beforeEach(prepare)
  afterEach(cleanup)
  test("composição registra a ferramenta e o encerramento", registersAdvisor)
  test("consulta usa o sinal de vida ainda ativo", consultsWithLiveSignal)
  test("encerramento repetido aborta uma vez, com erro como motivo", shutdownAbortsOnce)
  test("consulta depois do encerramento é recusada sem chamar o modelo", refusesAfterShutdown)
  test("sem arquivo de configuração o advisor fica desligado", missingConfiguration)
  test("configuração inválida é informada", invalidConfigurationIsReported)
  test("configuração inválida desliga a ferramenta", invalidConfigurationDisablesTool)
  test("configuração inválida recusa a consulta sem chamar o modelo", invalidConfigurationRefusesConsultation)
  test("configuração inválida não sobrescreve o arquivo", invalidConfigurationIsPreserved)
  test("composição registra a repetição por cooldown", registersCooldownRetry)
  test("composição registra o modelo virtual do roteador", registersModelRouter)
  test("composição registra as regras de resposta", registersResponseRules)
  test("sem arquivo de instruções o pedido segue sem lembrete", ignoresMissingResponseRules)
}

describe("composition", registerTests)
