import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";

const SCRIPT = [
  "import register from './dist/index.js';",
  "let command; const pi={on(){},registerTool(){},registerCommand(_name,value){command=value},getActiveTools(){return []},setActiveTools(){}};",
  "const ctx={hasUI:false,scopedModels:[],modelRegistry:{getAvailable(){return []}},ui:{notify(message){console.log(message)},setStatus(){}}};",
  "register(pi); await command.handler('',ctx);",
].join(String.fromCharCode(10));

test("a distribuição rejeita níveis inválidos sem substituir o modelo", () => {
  const home = mkdtempSync(join(tmpdir(), "synapse-config-"));
  try {
    const directory = join(home, ".pi", "agent");
    mkdirSync(directory, { recursive: true });
    for (const thinking of ["banana", 42]) {
      writeFileSync(join(directory, "advisor.json"), JSON.stringify({ model: "openai/gpt-x", thinking }));
      const result = spawnSync(process.execPath, ["--input-type=module", "-e", SCRIPT], {
        cwd: process.cwd(),
        env: { ...process.env, HOME: home, USERPROFILE: home },
        encoding: "utf8",
      });
      assert.equal(result.status, 0, result.stderr);
      assert.doesNotMatch(result.stdout, /thinking (banana|42)/);
      assert.doesNotMatch(result.stdout, /omniroute/);
    }
  } finally {
    rmSync(home, { recursive: true, force: true });
  }
});
