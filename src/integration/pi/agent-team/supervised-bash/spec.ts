import { getShellConfig } from "@earendil-works/pi-coding-agent"
import { type SupervisedShellSpec } from "#synapse/modules/agent-team/public/supervised-shell"
import { SUPERVISED_BASH_STDIN } from "./constants"

export function buildSupervisedBashSpec(
  command: string,
  cwd: string,
  environment: NodeJS.ProcessEnv,
  shellPath?: string,
): SupervisedShellSpec {
  const shell = getShellConfig(shellPath)
  const spec: SupervisedShellSpec = { executable: shell.shell, arguments: [...shell.args, command], cwd, environment }
  if (shell.commandTransport === SUPERVISED_BASH_STDIN) {
    spec.arguments = shell.args
    spec.input = command
  }
  return spec
}
