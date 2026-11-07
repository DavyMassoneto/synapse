import assert from "node:assert/strict";
import { test } from "node:test";
import { REMIND_EVERY, REMINDER, ReminderCounter } from "@/modules/advisor/internal/reminder";

function verifyReminder(): void {
  const first = new ReminderCounter();
  const second = new ReminderCounter();

  for (let index = 1; index < REMIND_EVERY; index++) {
    assert.equal(first.advance({ completed: true, usedTools: true }), false);
  }
  assert.equal(first.advance({ completed: false, usedTools: true }), false);
  assert.equal(first.advance({ completed: true, usedTools: false }), false);
  assert.equal(first.advance({ completed: true, usedTools: true }), true);
  assert.equal(second.advance({ completed: true, usedTools: true }), false);
  second.reset();
  assert.equal(second.advance({ completed: true, usedTools: true }), false);
  assert.ok(REMINDER.includes(String(REMIND_EVERY)));
}

test("lembrete respeita cadência e estado isolado", verifyReminder);
