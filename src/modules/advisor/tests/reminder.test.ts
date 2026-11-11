import { describe, expect, test } from "vitest"
import { isReminderDue, REMIND_EVERY, REMINDER, ReminderCounter } from "../internal"
import { type ReminderTurn } from "../public"

const WITH_TOOLS: ReminderTurn = { completed: true, usedTools: true }

function countTurns(counter: ReminderCounter, turns: number): void {
  for (let index = 0; index < turns; index++) {
    counter.count(WITH_TOOLS)
  }
}

function cadence(): void {
  const counter = new ReminderCounter()
  countTurns(counter, REMIND_EVERY - 1)
  expect(isReminderDue(counter.turns, WITH_TOOLS)).toBe(false)
  counter.count(WITH_TOOLS)
  expect(isReminderDue(counter.turns, WITH_TOOLS)).toBe(true)
}

function incompleteTurn(): void {
  const counter = new ReminderCounter()
  countTurns(counter, REMIND_EVERY - 1)
  const incomplete: ReminderTurn = { completed: false, usedTools: true }
  counter.count(incomplete)
  expect(isReminderDue(counter.turns, incomplete)).toBe(false)
  expect(isReminderDue(counter.turns, WITH_TOOLS)).toBe(false)
  counter.count(WITH_TOOLS)
  expect(isReminderDue(counter.turns, WITH_TOOLS)).toBe(true)
}

function turnWithoutTools(): void {
  const counter = new ReminderCounter()
  countTurns(counter, REMIND_EVERY - 1)
  const withoutTools: ReminderTurn = { completed: true, usedTools: false }
  counter.count(withoutTools)
  expect(isReminderDue(counter.turns, withoutTools)).toBe(false)
  counter.count(WITH_TOOLS)
  expect(isReminderDue(counter.turns, WITH_TOOLS)).toBe(true)
}

function isolatedCounters(): void {
  const first = new ReminderCounter()
  const second = new ReminderCounter()
  countTurns(first, REMIND_EVERY)
  second.count(WITH_TOOLS)
  expect(isReminderDue(first.turns, WITH_TOOLS)).toBe(true)
  expect(isReminderDue(second.turns, WITH_TOOLS)).toBe(false)
}

function resetCadence(): void {
  const counter = new ReminderCounter()
  countTurns(counter, REMIND_EVERY)
  counter.reset()
  expect(isReminderDue(counter.turns, WITH_TOOLS)).toBe(false)
  countTurns(counter, REMIND_EVERY - 1)
  expect(isReminderDue(counter.turns, WITH_TOOLS)).toBe(false)
  counter.count(WITH_TOOLS)
  expect(isReminderDue(counter.turns, WITH_TOOLS)).toBe(true)
}

function reminderText(): void {
  expect(REMINDER).toContain(String(REMIND_EVERY))
}

function registerTests(): void {
  test("lembrete respeita cadência", cadence)
  test("turno incompleto não conta", incompleteTurn)
  test("turno sem ferramenta conta sem emitir", turnWithoutTools)
  test("contadores são isolados", isolatedCounters)
  test("reset reinicia cadência", resetCadence)
  test("texto informa cadência", reminderText)
}

describe("reminder", registerTests)
