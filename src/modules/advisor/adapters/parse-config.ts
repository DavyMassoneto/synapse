import { Value } from "typebox/value";
import type { ConfigLoadResult } from "../internal";
import { configSchema } from "./config-schema";
import { CONFIG_DIAGNOSTICS } from "./diagnostics";

export function parseConfig(content: string): ConfigLoadResult {
  try {
    return { kind: "loaded", config: Value.Parse(configSchema, JSON.parse(content)) };
  } catch {
    return { kind: "invalid", message: CONFIG_DIAGNOSTICS.invalid };
  }
}
