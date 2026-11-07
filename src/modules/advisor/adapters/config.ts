import { randomUUID } from "node:crypto";
import { mkdirSync, readFileSync, renameSync, unlinkSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";
import { Value } from "typebox/value";
import { configSchema } from "@/modules/advisor/adapters/schema";
import { type ConfigLoadResult } from "@/modules/advisor/internal/config";
import { type Config } from "@/modules/advisor/public/config";

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
      return { kind: "invalid", message: "Não foi possível ler a configuração do advisor." };
    }

    try {
      const config = Value.Parse(configSchema, JSON.parse(content));
      return {
        kind: "loaded",
        config,
      };
    } catch {
      return { kind: "invalid", message: "Configuração do advisor inválida; revise advisor.json." };
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
