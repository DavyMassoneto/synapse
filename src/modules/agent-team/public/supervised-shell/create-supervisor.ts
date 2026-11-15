import {
  UnixSupervisedShellLauncher,
  WindowsSupervisedShellLauncher,
} from "#synapse/modules/agent-team/adapters/supervised-shell"
import { SupervisedShellSupervisor } from "#synapse/modules/agent-team/internal/supervised-shell"
import {
  SUPERVISED_SHELL_WINDOWS,
  type SupervisedShellLease,
  type SupervisedShellOutput,
  type SupervisedShellService,
  type SupervisedShellSpec,
} from "./contracts"

export function createSupervisedShell(): SupervisedShellService {
  if (process.platform === SUPERVISED_SHELL_WINDOWS) {
    return new SupervisedShellSupervisor(new WindowsSupervisedShellLauncher())
  }
  return new SupervisedShellSupervisor(new UnixSupervisedShellLauncher())
}

export function createPreparedShell(
  spec: SupervisedShellSpec,
  output: SupervisedShellOutput,
): Promise<SupervisedShellLease> {
  if (process.platform === SUPERVISED_SHELL_WINDOWS) {
    return new WindowsSupervisedShellLauncher().create(spec, output)
  }
  return new UnixSupervisedShellLauncher().create(spec, output)
}
