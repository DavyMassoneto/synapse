import { readFileSync } from "node:fs";
import type { ConfigLoadResult } from "../internal";
import type { Config } from "../public/contracts";
import { CONFIG_DIAGNOSTICS } from "./diagnostics";
import { parseConfig } from "./parse-config";
import { replaceConfig } from "./replace-config";

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
    return parseConfig(content);
  }

  save(config: Config): void {
    replaceConfig(this.path, config);
  }
}
