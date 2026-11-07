import type { Config, ThinkingLevel } from "#synapse/modules/advisor/public/contracts";

export interface ConfigPort {
  load(): ConfigLoadResult;
  save(config: Config): void;
}

export type ConfigLoadResult = ConfigMissing | ConfigLoaded | ConfigInvalid;

export interface ConfigMissing {
  kind: "missing";
}

export interface StoredConfig {
  model?: string;
  thinking?: ThinkingLevel;
}

export interface ConfigLoaded {
  kind: "loaded";
  config: StoredConfig;
}

export interface ConfigInvalid {
  kind: "invalid";
  message: string;
}
