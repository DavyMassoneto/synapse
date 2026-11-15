import { type ShellWireEnvironmentEntry } from "../wire"

export function createUnixShellEnvironment(entries: ShellWireEnvironmentEntry[]): NodeJS.ProcessEnv {
  const environment: NodeJS.ProcessEnv = {}
  for (const entry of entries) {
    environment[entry.name] = entry.value
  }
  return environment
}
