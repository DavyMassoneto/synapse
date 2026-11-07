import { randomUUID } from "node:crypto";
import { mkdirSync, readFileSync, renameSync, unlinkSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";
import { Value } from "typebox/value";
import type { ConfigLoadResult } from "#synapse/modules/advisor/internal/config";
import type { Config } from "../public";
import { configSchema } from "./config-schema.ts";

import { CONFIG_DIAGNOSTICS } from "./diagnostics.ts";

export class FileConfig {
  constructor(private readonly path: string) {}

  load(): ConfigLoadResult {
    let content: string;
    try {
      content = readFileSync(this.path, "utf8");
    } catch (error) {
      if (error instanceof Error && "code" in error && error.code === "ENOENT") {
        return { kind: "missing" };
      }
      return { kind: "invalid", message: CONFIG_DIAGNOSTICS.readFailed };
    }

    try {
      const config = Value.Parse(configSchema, JSON.parse(content));
      return {
        kind: "loaded",
        config,
      };
    } catch {
      return { kind: "invalid", message: CONFIG_DIAGNOSTICS.invalid };
    }
  }

  save(config: Config): void {
    mkdirSync(dirname(this.path), { recursive: true });
    const temporary = `${this.path}.${randomUUID()}.tmp`;
    try {
      writeFileSync(temporary, `${JSON.stringify(config, null, 2)}\n`, { flag: "wx" });
      renameSync(temporary, this.path);
    } catch (error) {
      try {
        unlinkSync(temporary);
      } catch {
        // The temporary file may not have been created.
      }
      throw error;
    }
  }
}
