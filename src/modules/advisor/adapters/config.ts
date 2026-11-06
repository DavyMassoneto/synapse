import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { dirname, join } from "node:path";
import { Value } from "typebox/value";
import { type Config } from "@/modules";
import { configSchema } from "@/modules/advisor/adapters";

const CONFIG_PATH = join(homedir(), ".pi", "agent", "advisor.json");
const DEFAULT_MODEL = "omniroute/cc/claude-opus-5-5";

export function loadConfig(): Config {
  try {
    const config = Value.Parse(configSchema, JSON.parse(readFileSync(CONFIG_PATH, "utf8")));
    return { model: config.model || undefined, thinking: config.thinking ?? "high" };
  } catch {
    return { model: DEFAULT_MODEL, thinking: "high" };
  }
}

export function saveConfig(config: Config): void {
  mkdirSync(dirname(CONFIG_PATH), { recursive: true });
  writeFileSync(CONFIG_PATH, `${JSON.stringify(config, null, 2)}\n`);
}
