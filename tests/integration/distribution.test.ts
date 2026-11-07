import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { expect, test } from "vitest";
import { CASES, type ConfigCase, runDistribution } from "../fixtures";

async function verifyDistribution(example: ConfigCase): Promise<void> {
  const home = mkdtempSync(join(tmpdir(), "synapse-config-"));
  const directory = join(home, ".pi", "agent");
  const file = join(directory, "advisor.json");
  mkdirSync(directory, { recursive: true });
  const previousHome = process.env.HOME;
  const previousProfile = process.env.USERPROFILE;
  process.env.HOME = home;
  process.env.USERPROFILE = home;
  try {
    if (example.content !== undefined) {
      writeFileSync(file, example.content);
    }
    const result = await runDistribution(home);
    expect(result.notices.join("\n")).toMatch(example.expected);
    if (example.content === undefined) {
      expect(existsSync(file)).toBe(false);
    } else {
      expect(readFileSync(file, "utf8")).toBe(example.content);
    }
    if (example.invalid) {
      expect(result.lookups).toBe(0);
      expect(result.isError).toBe(true);
    }
  } finally {
    if (previousHome === undefined) {
      delete process.env.HOME;
    } else {
      process.env.HOME = previousHome;
    }
    if (previousProfile === undefined) {
      delete process.env.USERPROFILE;
    } else {
      process.env.USERPROFILE = previousProfile;
    }
    rmSync(home, { recursive: true, force: true });
  }
}

test.each(CASES)("distribuição: $name", verifyDistribution);
