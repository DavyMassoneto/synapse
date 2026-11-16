import { type ShellWireEnvironmentEntry } from "#synapse/modules/agent-team/adapters/supervised-shell/wire"

export function createUnixShellEnvironment(entries: ShellWireEnvironmentEntry[]): NodeJS.ProcessEnv {
  const environment: NodeJS.ProcessEnv = {}
  for (const entry of entries) {
    environment[entry.name] = entry.value
  }
  return environment
}
