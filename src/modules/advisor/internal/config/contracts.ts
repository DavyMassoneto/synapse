import { type Config } from "@/modules/advisor/public";

export interface ConfigPort {
  load(): ConfigLoadResult;
  save(config: Config): void;
}

export type ConfigLoadResult = ConfigMissing | ConfigLoaded | ConfigInvalid;

export interface ConfigMissing {
  kind: "missing";
}

export interface ConfigLoaded {
  kind: "loaded";
  config: Config;
}

export interface ConfigInvalid {
  kind: "invalid";
  message: string;
}
