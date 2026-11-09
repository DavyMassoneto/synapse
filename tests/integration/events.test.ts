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
function cleanup(): void {
  host.cleanup()
}

async function sessionStart(): Promise<void> {
  for (const handler of host.starts) {
    await handler({ type: "session_start", reason: "startup" }, context)
  }
  expect(host.advisor.isEnabled()).toBe(true)
  expect(host.active).toContain("advisor")
}

async function instructions(): Promise<void> {
  const event = beforeStartEvent()
  for (const handler of host.beforeStarts) {
    await handler(event, context)
  }
  expect(event.systemPromptOptions.sections.advisor).toBeTruthy()
}

async function reminderCadence(): Promise<void> {
  const event = turnEvent()
  for (let index = 0; index < 4; index++) {
    for (const handler of host.turns) {
      expect(await handler(event, context)).toBeUndefined()
    }
  }
  for (const handler of host.turns) {
    const reminder = await handler(event, context)
    const entry = reminder?.entries?.at(-1)
    expect(entry?.type).toBe("custom_message")
    if (entry?.type !== "custom_message") {
      throw new Error("lembrete ausente")
    }
    expect(entry.customType).toBe("advisor-reminder")
  }
}

async function toolResetsReminder(): Promise<void> {
  const event = turnEvent()
  for (let index = 0; index < 4; index++) {
    for (const handler of host.turns) {
      await handler(event, context)
    }
  }
  for (const handler of host.toolResults) {
    await handler(advisorToolResult(), context)
  }
  for (const handler of host.turns) {
    expect(await handler(event, context)).toBeUndefined()
  }
}

async function disabledAdvisor(): Promise<void> {
  const event = beforeStartEvent()
  for (const handler of host.beforeStarts) {
    await handler(event, context)
  }
  host.active = ["read", "advisor", "write", "advisor", "read"]
  host.advisor.configuration.disable()
  expect(host.advisor.isEnabled()).toBe(false)
  for (const handler of host.beforeStarts) {
    await handler(event, context)
  }
  expect(event.systemPromptOptions.sections.advisor).toBeUndefined()
  expect(host.active).toStrictEqual(["read", "write", "read"])
}

function registerTests(): void {
  beforeEach(prepare)
  afterEach(cleanup)
  test("início ativa ferramenta", sessionStart)
  test("instruções são inseridas", instructions)
  test("lembrete respeita cadência", reminderCadence)
  test("resultado da ferramenta reinicia lembrete", toolResetsReminder)
  test("desligamento remove ferramenta e instruções", disabledAdvisor)
}

describe("events", registerTests)
