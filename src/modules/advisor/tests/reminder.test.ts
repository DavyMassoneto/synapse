import { describe, expect, test } from "vitest"
import { REMIND_EVERY, REMINDER, ReminderCounter } from "../internal"
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
  expect(counter.isDue(WITH_TOOLS)).toBe(false)
  counter.count(WITH_TOOLS)
  expect(counter.isDue(WITH_TOOLS)).toBe(true)
}

function incompleteTurn(): void {
  const counter = new ReminderCounter()
  countTurns(counter, REMIND_EVERY - 1)
  const incomplete: ReminderTurn = { completed: false, usedTools: true }
  counter.count(incomplete)
  expect(counter.isDue(incomplete)).toBe(false)
  expect(counter.isDue(WITH_TOOLS)).toBe(false)
  counter.count(WITH_TOOLS)
  expect(counter.isDue(WITH_TOOLS)).toBe(true)
}

function turnWithoutTools(): void {
  const counter = new ReminderCounter()
  countTurns(counter, REMIND_EVERY - 1)
  const withoutTools: ReminderTurn = { completed: true, usedTools: false }
  counter.count(withoutTools)
  expect(counter.isDue(withoutTools)).toBe(false)
  counter.count(WITH_TOOLS)
  expect(counter.isDue(WITH_TOOLS)).toBe(true)
}

function isolatedCounters(): void {
  const first = new ReminderCounter()
  const second = new ReminderCounter()
  countTurns(first, REMIND_EVERY)
  second.count(WITH_TOOLS)
  expect(first.isDue(WITH_TOOLS)).toBe(true)
  expect(second.isDue(WITH_TOOLS)).toBe(false)
}

function resetCadence(): void {
  const counter = new ReminderCounter()
  countTurns(counter, REMIND_EVERY)
  counter.reset()
  expect(counter.isDue(WITH_TOOLS)).toBe(false)
  countTurns(counter, REMIND_EVERY - 1)
  expect(counter.isDue(WITH_TOOLS)).toBe(false)
  counter.count(WITH_TOOLS)
  expect(counter.isDue(WITH_TOOLS)).toBe(true)
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
