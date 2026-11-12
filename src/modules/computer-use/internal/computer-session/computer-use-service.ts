import { randomUUID } from "node:crypto"
import {
  COMPUTER_DIAGNOSTIC_READY,
  COMPUTER_DIAGNOSTIC_UNAVAILABLE,
  COMPUTER_FAILED,
  COMPUTER_INSTALL_FAILED,
  COMPUTER_INSTALL_SUCCEEDED,
  COMPUTER_REFUSED,
  type ComputerAction,
  type ComputerDiagnostic,
  type ComputerDriverInfrastructure,
  type ComputerExecuteResult,
  type ComputerExecutionContext,
  type ComputerInstallResult,
  type ComputerUse,
  type ComputerUseDependencies,
} from "#synapse/modules/computer-use/public/contracts"
import { ComputerActionDispatch, computerDispatchFailure } from "../action-dispatch"
import { COMPUTER_SAFETY_REFUSED, computerCheckActionSafety } from "../action-safety"
import { COMPUTER_DRIVER_COMPATIBLE, computerCheckDriverVersion } from "../driver-compatibility"
import { ComputerDriverSession } from "../driver-session"
import { attemptComputer } from "./attempt-computer"
import { COMPUTER_SESSION_DISPATCH_ACTIVE, COMPUTER_SESSION_DISPATCH_IDLE } from "./constants"
import { hasComputerOverlay } from "./predicates"
import { type ComputerCheckedDriver, type ComputerDispatchState } from "./types"

export class ComputerUseService implements ComputerUse {
  private readonly dependencies: ComputerUseDependencies

  private dispatch: ComputerDispatchState = { kind: COMPUTER_SESSION_DISPATCH_IDLE }

  private queue?: Promise<ComputerExecuteResult>

  private readonly infrastructure: ComputerDriverInfrastructure

  constructor(dependencies: ComputerUseDependencies, infrastructure: ComputerDriverInfrastructure) {
    this.infrastructure = infrastructure
    this.dependencies = dependencies
  }

  async execute(action: ComputerAction, context: ComputerExecutionContext): Promise<ComputerExecuteResult> {
    const safety = computerCheckActionSafety(action, this.dependencies.platform)
    if (safety.kind === COMPUTER_SAFETY_REFUSED) {
      return computerDispatchFailure(action, safety.message, COMPUTER_REFUSED)
    }
    const perform = this.perform.bind(this, action, context)
    const run = this.queue ? this.queue.then(perform, perform) : perform()
    this.queue = run
    return run
  }

  private perform(action: ComputerAction, context: ComputerExecutionContext): Promise<ComputerExecuteResult> {
    return attemptComputer(this.executeAction.bind(this, action, context), this.executionFailure.bind(this, action))
  }

  private async executeAction(
    action: ComputerAction,
    context: ComputerExecutionContext,
  ): Promise<ComputerExecuteResult> {
    const dispatch = await this.getDispatch()
    return dispatch.execute(action, context)
  }

  private executionFailure(action: ComputerAction, message: string): ComputerExecuteResult {
    return computerDispatchFailure(action, message, COMPUTER_FAILED)
  }

  diagnose(): Promise<ComputerDiagnostic> {
    return attemptComputer(this.readDriverDiagnostic.bind(this), this.diagnosticFailure.bind(this))
  }

  private async readDriverDiagnostic(): Promise<ComputerDiagnostic> {
    const checked = await this.checkedDriver()
    return { kind: COMPUTER_DIAGNOSTIC_READY, binary: checked.launch.command, version: checked.manifest.version }
  }

  private diagnosticFailure(message: string): ComputerDiagnostic {
    return { kind: COMPUTER_DIAGNOSTIC_UNAVAILABLE, message }
  }

  install(): Promise<ComputerInstallResult> {
    return attemptComputer(this.installDriver.bind(this), this.installationFailure.bind(this))
  }

  private async installDriver(): Promise<ComputerInstallResult> {
    const binary = await this.infrastructure.install()
    return { kind: COMPUTER_INSTALL_SUCCEEDED, binary }
  }

  private installationFailure(message: string): ComputerInstallResult {
    return { kind: COMPUTER_INSTALL_FAILED, message }
  }

  async stop(): Promise<void> {
    const state = this.dispatch
    if (state.kind === COMPUTER_SESSION_DISPATCH_ACTIVE) {
      await state.dispatch.stop()
      this.dispatch = { kind: COMPUTER_SESSION_DISPATCH_IDLE }
    }
  }

  private async checkedDriver(): Promise<ComputerCheckedDriver> {
    const launch = await this.infrastructure.launch()
    const manifest = await this.infrastructure.manifest(launch)
    const compatibility = computerCheckDriverVersion(manifest.version)
    if (compatibility.kind !== COMPUTER_DRIVER_COMPATIBLE) {
      throw new Error(compatibility.message)
    }
    return { launch, manifest }
  }

  private async getDispatch(): Promise<ComputerActionDispatch> {
    const state = this.dispatch
    if (state.kind === COMPUTER_SESSION_DISPATCH_ACTIVE) {
      return state.dispatch
    }
    const dispatch = this.mountDispatch(await this.checkedDriver())
    this.dispatch = { kind: COMPUTER_SESSION_DISPATCH_ACTIVE, dispatch }
    return dispatch
  }

  private mountDispatch(checked: ComputerCheckedDriver): ComputerActionDispatch {
    const driver = this.infrastructure.driver({ ...checked.launch, arguments: checked.manifest.arguments })
    return new ComputerActionDispatch(
      new ComputerDriverSession(driver, randomUUID(), hasComputerOverlay(this.dependencies.environment)),
      this.dependencies.platform,
      this.dependencies.wait,
      this.infrastructure.storage,
    )
  }
}
