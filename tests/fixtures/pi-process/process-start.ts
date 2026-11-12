import { join } from "node:path"
import { fileURLToPath } from "node:url"
import { type PiProcessModelSelection } from "../model-selection"
import { PI_REQUEST_LOG_FILE, PI_REQUEST_LOG_VARIABLE } from "../request-log"
import {
  PI_PROCESS_MODEL_VARIABLE,
  PI_PROCESS_PROVIDER_URL,
  PI_PROCESS_PROVIDER_VARIABLE,
  PI_PROCESS_SCRIPT_FILE,
  PI_PROCESS_SCRIPT_VARIABLE,
} from "../scripted-provider"
import {
  PI_PROCESS_AGENT_VARIABLE,
  PI_PROCESS_APPDATA_VARIABLE,
  PI_PROCESS_CACHE_VARIABLE,
  PI_PROCESS_CONFIG_VARIABLE,
  PI_PROCESS_EXTENSION_FLAG,
  PI_PROCESS_FLAGS,
  PI_PROCESS_HOME_VARIABLE,
  PI_PROCESS_LOCAL_APPDATA_VARIABLE,
  PI_PROCESS_MODEL_FLAG,
  PI_PROCESS_PATH_VARIABLE,
  PI_PROCESS_PROFILE_VARIABLE,
  PI_PROCESS_SYSTEM_ROOT_VARIABLE,
  PI_PROCESS_WINDOWS_VARIABLE,
} from "./constants"
import { resolvePiProcessExecutable } from "./process-paths"

export function piProcessSelectedArguments(entrypoint: string, selection: PiProcessModelSelection): string[] {
  return [
    resolvePiProcessExecutable(),
    ...PI_PROCESS_FLAGS,
    PI_PROCESS_EXTENSION_FLAG,
    entrypoint,
    PI_PROCESS_EXTENSION_FLAG,
    fileURLToPath(PI_PROCESS_PROVIDER_URL),
    PI_PROCESS_MODEL_FLAG,
    selection.startupModel,
  ]
}

export function piProcessSelectedEnvironment(
  home: string,
  agentDirectory: string,
  selection: PiProcessModelSelection,
): NodeJS.ProcessEnv {
  return {
    [PI_PROCESS_PATH_VARIABLE]: process.env[PI_PROCESS_PATH_VARIABLE],
    [PI_PROCESS_SYSTEM_ROOT_VARIABLE]: process.env[PI_PROCESS_SYSTEM_ROOT_VARIABLE],
    [PI_PROCESS_WINDOWS_VARIABLE]: process.env[PI_PROCESS_WINDOWS_VARIABLE],
    [PI_PROCESS_HOME_VARIABLE]: home,
    [PI_PROCESS_PROFILE_VARIABLE]: home,
    [PI_PROCESS_AGENT_VARIABLE]: agentDirectory,
    [PI_PROCESS_APPDATA_VARIABLE]: home,
    [PI_PROCESS_LOCAL_APPDATA_VARIABLE]: home,
    [PI_PROCESS_CONFIG_VARIABLE]: home,
    [PI_PROCESS_CACHE_VARIABLE]: home,
    [PI_PROCESS_PROVIDER_VARIABLE]: selection.provider,
    [PI_PROCESS_MODEL_VARIABLE]: selection.model,
    [PI_PROCESS_SCRIPT_VARIABLE]: join(home, PI_PROCESS_SCRIPT_FILE),
    [PI_REQUEST_LOG_VARIABLE]: join(home, PI_REQUEST_LOG_FILE),
  }
}
