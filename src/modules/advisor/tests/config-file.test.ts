import assert from "node:assert/strict";
import { mkdirSync, mkdtempSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "vitest";
import { FileConfig } from "#synapse/modules/advisor/adapters";
import { AdvisorService } from "#synapse/modules/advisor/internal";

function readsDefaultsAndDisabled(): void {
  const directory = mkdtempSync(join(tmpdir(), "advisor-config-"));
  try {
    const path = join(directory, "advisor.json");
    const storage = new FileConfig(path);
    const missing = storage.load();
    assert.equal(missing.kind, "missing");
    const absent = new AdvisorService(storage, missing).status();
    assert.deepEqual(absent, { kind: "success", config: { thinking: "high" } });

    writeFileSync(path, JSON.stringify({ model: "", thinking: "low" }));
    const disabled = new AdvisorService(storage, storage.load()).status();
    assert.deepEqual(disabled, { kind: "success", config: { model: undefined, thinking: "low" } });

    writeFileSync(path, JSON.stringify({ model: "provider/model" }));
    const defaulted = new AdvisorService(storage, storage.load()).status();
    assert.deepEqual(defaulted, {
      kind: "success",
      config: { model: "provider/model", thinking: "high" },
    });
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
}

function atomicallyReplacesFile(): void {
  const directory = mkdtempSync(join(tmpdir(), "advisor-config-"));
  try {
    const path = join(directory, "advisor.json");
    const storage = new FileConfig(path);
    writeFileSync(path, "old");
    storage.save({ model: "provider/new", thinking: "low" });
    assert.match(readFileSync(path, "utf8"), /provider\/new/);
    assert.deepEqual(readdirSync(directory), ["advisor.json"]);

    const blockedPath = join(directory, "blocked");
    mkdirSync(blockedPath);
    writeFileSync(join(blockedPath, "keep"), "original");
    assert.throws(storageFailure.bind(undefined, blockedPath));
    assert.equal(readFileSync(join(blockedPath, "keep"), "utf8"), "original");
    assert.deepEqual(readdirSync(directory).sort(), ["advisor.json", "blocked"]);
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
}

function storageFailure(path: string): void {
  new FileConfig(path).save({ thinking: "high" });
}

test("configuração ausente, desligada e default", readsDefaultsAndDisabled);
test("gravação substitui destino e limpa temporário na falha", atomicallyReplacesFile);
