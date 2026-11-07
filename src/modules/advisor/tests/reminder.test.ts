import { describe, expect, test } from "vitest";
import { REMIND_EVERY, REMINDER, ReminderCounter } from "../internal";

function cadence(): void {
  const counter = new ReminderCounter();
  for (let index = 1; index < REMIND_EVERY; index++) {
    expect(counter.advance({ completed: true, usedTools: true })).toBe(false);
  }
  expect(counter.advance({ completed: true, usedTools: true })).toBe(true);
}

function incompleteTurn(): void {
  const counter = new ReminderCounter();
  for (let index = 1; index < REMIND_EVERY; index++) {
    counter.advance({ completed: true, usedTools: true });
  }
  expect(counter.advance({ completed: false, usedTools: true })).toBe(false);
  expect(counter.advance({ completed: true, usedTools: true })).toBe(true);
}

function turnWithoutTools(): void {
  const counter = new ReminderCounter();
  for (let index = 1; index < REMIND_EVERY; index++) {
    counter.advance({ completed: true, usedTools: true });
  }
  expect(counter.advance({ completed: true, usedTools: false })).toBe(false);
  expect(counter.advance({ completed: true, usedTools: true })).toBe(true);
}

function isolatedCounters(): void {
  const first = new ReminderCounter();
  const second = new ReminderCounter();
  for (let index = 0; index < REMIND_EVERY; index++) {
    first.advance({ completed: true, usedTools: true });
  }
  expect(second.advance({ completed: true, usedTools: true })).toBe(false);
}

function resetCadence(): void {
  const counter = new ReminderCounter();
  for (let index = 1; index < REMIND_EVERY; index++) {
    counter.advance({ completed: true, usedTools: true });
  }
  counter.reset();
  for (let index = 1; index < REMIND_EVERY; index++) {
    expect(counter.advance({ completed: true, usedTools: true })).toBe(false);
  }
  expect(counter.advance({ completed: true, usedTools: true })).toBe(true);
}

function reminderText(): void {
  expect(REMINDER).toContain(String(REMIND_EVERY));
}

function registerTests(): void {
  test("lembrete respeita cadência", cadence);
  test("turno incompleto não conta", incompleteTurn);
  test("turno sem ferramenta conta sem emitir", turnWithoutTools);
  test("contadores são isolados", isolatedCounters);
  test("reset reinicia cadência", resetCadence);
  test("texto informa cadência", reminderText);
}

describe("reminder", registerTests);
