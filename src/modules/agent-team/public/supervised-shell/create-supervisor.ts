import {
  UnixSupervisedShellLauncher,
  WindowsSupervisedShellLauncher,
} from "#synapse/modules/agent-team/adapters/supervised-shell"
import { SupervisedShellSupervisor } from "#synapse/modules/agent-team/internal/supervised-shell"
import { SUPERVISED_SHELL_WINDOWS, type SupervisedShellService } from "./contracts"

export function createSupervisedShell(): SupervisedShellService {
  if (process.platform === SUPERVISED_SHELL_WINDOWS) {
    return new SupervisedShellSupervisor(new WindowsSupervisedShellLauncher())
  }
  return new SupervisedShellSupervisor(new UnixSupervisedShellLauncher())
}
