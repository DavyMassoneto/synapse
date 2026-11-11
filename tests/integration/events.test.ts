import { afterEach, beforeEach, describe, expect, test } from "vitest"
import { beforeStartEvent, hostScenario, type TestContext, type TypedAdvisorHost, turnEvent } from "../fixtures"

let host: TypedAdvisorHost
let context: TestContext

function prepare(): void {
  ;({ host, context } = hostScenario())
}

async function sessionStart(): Promise<void> {
  await host.emitSessionStart(context)
  expect(host.advisor.activeModel().kind).toBe("active")
  expect(host.active).toContain("advisor")
}

async function instructions(): Promise<void> {
  const event = beforeStartEvent()
  await host.emitBeforeStart(event, context)
  expect(event.systemPromptOptions.sections.advisor).toBeTruthy()
}

async function noReminderBeforeCadence(): Promise<void> {
  expect(await host.emitTurnEnds(turnEvent(), context, 4)).toStrictEqual([undefined, undefined, undefined, undefined])
}

async function reminderAtCadence(): Promise<void> {
  const event = turnEvent()
  await host.emitTurnEnds(event, context, 4)
  const [reminder] = await host.emitTurnEnd(event, context)
  const entry = reminder?.entries?.at(-1)
  expect(entry?.type).toBe("custom_message")
  if (entry?.type !== "custom_message") {
    throw new Error("lembrete ausente")
  }
  expect(entry.customType).toBe("advisor-reminder")
}

async function toolResetsReminder(): Promise<void> {
  const event = turnEvent()
  await host.emitTurnEnds(event, context, 4)
  await host.requireTool().execute("id", {}, undefined, undefined, context)
  expect(await host.emitTurnEnd(event, context)).toStrictEqual([undefined])
}

async function sessionStartResetsReminder(): Promise<void> {
  const event = turnEvent()
  await host.emitTurnEnds(event, context, 4)
  await host.emitSessionStart(context)
  expect(await host.emitTurnEnd(event, context)).toStrictEqual([undefined])
}

async function disablingRemovesInstructions(): Promise<void> {
  const event = beforeStartEvent()
  await host.emitBeforeStart(event, context)
  host.advisor.configuration.disable()
  await host.emitBeforeStart(event, context)
  expect(event.systemPromptOptions.sections.advisor).toBeUndefined()
}

async function disablingRemovesTool(): Promise<void> {
  host.active = ["read", "advisor", "write", "advisor", "read"]
  host.advisor.configuration.disable()
  await host.emitBeforeStart(beforeStartEvent(), context)
  expect(host.active).toStrictEqual(["read", "write", "read"])
}

async function disabledAdvisorDoesNotCount(): Promise<void> {
  const event = turnEvent()
  host.advisor.configuration.disable()
  await host.emitTurnEnds(event, context, 6)
  host.advisor.configuration.selectModel("provider/model")
  expect(await host.emitTurnEnd(event, context)).toStrictEqual([undefined])
}

function cleanup(): void {
  host.cleanup()
}

function registerTests(): void {
  beforeEach(prepare)
  afterEach(cleanup)
  test("início ativa ferramenta", sessionStart)
  test("instruções são inseridas", instructions)
  test("lembrete não aparece antes da cadência", noReminderBeforeCadence)
  test("lembrete aparece no quinto turno", reminderAtCadence)
  test("consulta reinicia lembrete", toolResetsReminder)
  test("início de sessão reinicia lembrete", sessionStartResetsReminder)
  test("desligamento remove as instruções", disablingRemovesInstructions)
  test("desligamento remove a ferramenta", disablingRemovesTool)
  test("turnos com o advisor desligado não contam para o lembrete", disabledAdvisorDoesNotCount)
}

describe("events", registerTests)
