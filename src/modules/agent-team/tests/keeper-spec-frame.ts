import { type ShellWireEnvironmentEntry } from "#synapse/modules/agent-team/adapters/supervised-shell/wire"
import { SHELL_RUNTIME_HEADER_BYTES, SHELL_TEST_BASH, SHELL_TEST_BASH_COMMAND_FLAG } from "./native-fixture-constants"

export function keeperSpecFrame(command: string, extraEnvironment?: NodeJS.ProcessEnv): Buffer {
  const environment: ShellWireEnvironmentEntry[] = []
  appendEnvironment(environment, process.env)
  if (extraEnvironment) {
    appendEnvironment(environment, extraEnvironment)
  }
  const spec = Buffer.from(
    JSON.stringify({
      executable: SHELL_TEST_BASH,
      arguments: [SHELL_TEST_BASH_COMMAND_FLAG, command],
      cwd: process.cwd(),
      environment,
    }),
  )
  const header = Buffer.alloc(SHELL_RUNTIME_HEADER_BYTES)
  header.writeUInt32BE(spec.length)
  return Buffer.concat([header, spec])
}

function appendEnvironment(entries: ShellWireEnvironmentEntry[], source: NodeJS.ProcessEnv): void {
  for (const [name, value] of Object.entries(source)) {
    if (typeof value === "string") {
      entries.push({ name, value })
    }
  }
}
