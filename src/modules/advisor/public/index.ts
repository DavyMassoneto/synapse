import { createService } from "../internal/service.ts";
import { loadConfig, saveConfig } from "../adapters/config.ts";
export type { Config, ConfigPort, TranscriptMessage, ModelPort } from "./contracts.ts";
export function createAdvisor() { return createService({ load: loadConfig, save: saveConfig }); }
