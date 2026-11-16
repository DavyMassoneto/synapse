import {
  UnixSupervisedShellLauncher,
  WindowsSupervisedShellLauncher,
} from "#synapse/modules/agent-team/adapters/supervised-shell"
import { SupervisedShellSupervisor } from "#synapse/modules/agent-team/internal/supervised-shell"
import {
  SUPERVISED_SHELL_LINUX,
  SUPERVISED_SHELL_MACOS,
  SUPERVISED_SHELL_PLATFORM_UNSUPPORTED,
  SUPERVISED_SHELL_WINDOWS,
  type SupervisedShellService,
} from "./contracts"

export function createSupervisedShell(): SupervisedShellService {
  if (process.platform === SUPERVISED_SHELL_WINDOWS) {
    return new SupervisedShellSupervisor(new WindowsSupervisedShellLauncher())
  }
  if (process.platform === SUPERVISED_SHELL_MACOS || process.platform === SUPERVISED_SHELL_LINUX) {
    return new SupervisedShellSupervisor(new UnixSupervisedShellLauncher())
  }
  throw new Error(SUPERVISED_SHELL_PLATFORM_UNSUPPORTED)
}
