import {
  type SupervisedShellLauncher,
  type SupervisedShellLease,
  type SupervisedShellOutput,
  type SupervisedShellSpec,
} from "#synapse/modules/agent-team/public/supervised-shell/contracts"
import { ShellLifecycleScenario } from "./shell-lifecycle-support"

export class AdmissionLauncher implements SupervisedShellLauncher {
  readonly scenarios: ShellLifecycleScenario[] = []
  async create(
    _spec: SupervisedShellSpec,
    _output: SupervisedShellOutput,
    signal?: AbortSignal,
  ): Promise<SupervisedShellLease> {
    const scenario = new ShellLifecycleScenario(false, signal)
    scenario.synchronousClose = true
    this.scenarios.push(scenario)
    await scenario.prepare()
    return scenario.lease
  }
}
