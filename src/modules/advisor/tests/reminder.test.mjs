import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { test } from "node:test";

const require = createRequire(import.meta.url);
const { createJiti } = require("jiti");
const jiti = createJiti(import.meta.url, { tsconfigPaths: true });
const { ReminderCounter, REMIND_EVERY } = await jiti.import("../internal/reminder/counter.ts");
const { REMINDER } = await jiti.import("../internal/format/reminder-text.ts");

function verifyReminder() {
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
