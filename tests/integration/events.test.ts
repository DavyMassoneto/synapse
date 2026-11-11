import { afterEach, beforeEach, describe, expect, test } from "vitest"
import {
  advisorToolResult,
  beforeStartEvent,
  prepareHostDirectory,
  TestContext,
  TypedAdvisorHost,
  turnEvent,
} from "../fixtures"

let host: TypedAdvisorHost
let context: TestContext

function prepare(): void {
  host = new TypedAdvisorHost(prepareHostDirectory())
  context = new TestContext()
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

async function reminderCadence(): Promise<void> {
  const event = turnEvent()
  for (let index = 0; index < 4; index++) {
    expect(await host.emitTurnEnd(event, context)).toStrictEqual([undefined])
  }
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
  for (let index = 0; index < 4; index++) {
    await host.emitTurnEnd(event, context)
  }
  await host.emitToolResult(advisorToolResult(), context)
  expect(await host.emitTurnEnd(event, context)).toStrictEqual([undefined])
}

async function disabledAdvisor(): Promise<void> {
  const event = beforeStartEvent()
  await host.emitBeforeStart(event, context)
  host.active = ["read", "advisor", "write", "advisor", "read"]
  host.advisor.configuration.disable()
  expect(host.advisor.activeModel().kind).toBe("inactive")
  await host.emitBeforeStart(event, context)
  expect(event.systemPromptOptions.sections.advisor).toBeUndefined()
  expect(host.active).toStrictEqual(["read", "write", "read"])
}

async function disabledAdvisorDoesNotCount(): Promise<void> {
  const event = turnEvent()
  host.advisor.configuration.disable()
  for (let index = 0; index < 6; index++) {
    expect(await host.emitTurnEnd(event, context)).toStrictEqual([undefined])
  }
  host.advisor.configuration.selectModel("provider/model")
  expect(await host.emitTurnEnd(event, context)).toStrictEqual([undefined])
}

function registerTests(): void {
  beforeEach(prepare)
  afterEach(() => host.cleanup())
  test("início ativa ferramenta", sessionStart)
  test("instruções são inseridas", instructions)
  test("lembrete respeita cadência", reminderCadence)
  test("resultado da ferramenta reinicia lembrete", toolResetsReminder)
  test("desligamento remove ferramenta e instruções", disabledAdvisor)
  test("turnos com o advisor desligado não contam para o lembrete", disabledAdvisorDoesNotCount)
}

describe("events", registerTests)
