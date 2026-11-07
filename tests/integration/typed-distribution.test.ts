import assert from "node:assert/strict";
import { type SpawnSyncReturns, spawnSync } from "node:child_process";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";

interface ConfigCase {
  name: string;
  content?: string;
  expected: RegExp;
  invalid?: boolean;
}

const CASES: ConfigCase[] = [
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

function verifyDistribution(): void {
  const fixture = process.env.SYNAPSE_DISTRIBUTION_FIXTURE;
  assert.ok(fixture);
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

      const result: SpawnSyncReturns<string> = spawnSync(process.execPath, [fixture], {
        cwd: process.cwd(),
        env: { ...process.env, HOME: home, USERPROFILE: home },
        encoding: "utf8",
      });
      assert.equal(result.status, 0, example.name + result.stderr);
      assert.match(result.stdout, example.expected, example.name);
      if (example.content === undefined) {
        assert.equal(existsSync(file), false);
      } else {
        assert.equal(readFileSync(file, "utf8"), example.content);
      }
      if (example.invalid) {
        assert.match(result.stdout, /LOOKUPS=0/);
        assert.match(result.stdout, /ERROR=true/);
      }
    }
  } finally {
    rmSync(home, { recursive: true, force: true });
  }
}

test("distribuição preserva configuração e informa erros", verifyDistribution);
