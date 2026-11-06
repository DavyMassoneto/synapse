import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";

const CASES = [
  { name: "ausente", expected: /Advisor: desligado, thinking high/ },
  {
    name: "válida",
    content: JSON.stringify({ model: "openai/gpt-x", thinking: "low" }),
    expected: /Advisor: openai\/gpt-x, thinking low/,
  },
  {
    name: "nível inválido",
    content: JSON.stringify({ model: "openai/gpt-x", thinking: "banana" }),
    expected: /Configuração do advisor inválida/,
    invalid: true,
  },
  {
    name: "nível numérico",
    content: JSON.stringify({ model: "openai/gpt-x", thinking: 42 }),
    expected: /Configuração do advisor inválida/,
    invalid: true,
  },
  {
    name: "JSON malformado",
    content: "{broken",
    expected: /Configuração do advisor inválida/,
    invalid: true,
  },
];

function verifyDistribution() {
  const home = mkdtempSync(join(tmpdir(), "synapse-config-"));
  const directory = join(home, ".pi", "agent");
  const file = join(directory, "advisor.json");
  mkdirSync(directory, { recursive: true });

  try {
    for (const example of CASES) {
      if (example.content === undefined) {
        rmSync(file, { force: true });
      } else {
        writeFileSync(file, example.content);
      }

      const processResult = spawnSync(process.execPath, ["tests/fixtures/config-host.mjs"], {
        cwd: process.cwd(),
        env: { ...process.env, HOME: home, USERPROFILE: home },
        encoding: "utf8",
      });

      assert.equal(processResult.status, 0, example.name + processResult.stderr);
      const result = JSON.parse(processResult.stdout);
      assert.match(result.notifications.join(" "), example.expected, example.name);
      if (example.content === undefined) {
        assert.equal(existsSync(file), false);
      } else {
        assert.equal(readFileSync(file, "utf8"), example.content);
      }
      if (example.invalid) {
        assert.equal(result.modelLookups, 0);
        assert.equal(result.result.isError, true);
      }
    }
  } finally {
    rmSync(home, { recursive: true, force: true });
  }
}

test("a distribuição preserva configuração e informa estados inválidos", verifyDistribution);
