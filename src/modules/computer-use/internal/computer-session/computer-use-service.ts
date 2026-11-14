import { randomUUID } from "node:crypto"
import {
  COMPUTER_CANCELLED,
  COMPUTER_DIAGNOSTIC_READY,
  COMPUTER_DIAGNOSTIC_UNAVAILABLE,
  COMPUTER_FAILED,
  COMPUTER_INSTALL_FAILED,
  COMPUTER_INSTALL_SUCCEEDED,
  COMPUTER_REFUSED,
  type ComputerAction,
  type ComputerDiagnostic,
  type ComputerDriverInfrastructure,
  type ComputerDriverLaunchRequest,
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
import { COMPUTER_CANCELLED_MESSAGE } from "../execution-cancellation"
import { attemptComputer } from "./attempt-computer"
import {
  COMPUTER_SESSION_DISPATCH_ACTIVE,
  COMPUTER_SESSION_DISPATCH_IDLE,
  COMPUTER_SESSION_STOPPED_MESSAGE,
} from "./constants"
import { hasComputerOverlay } from "./predicates"
import { type ComputerCheckedDriver, type ComputerDispatchState } from "./types"

export class ComputerUseService implements ComputerUse {
  private readonly dependencies: ComputerUseDependencies

  private dispatch: ComputerDispatchState = { kind: COMPUTER_SESSION_DISPATCH_IDLE }

  private generation = 0

  private stopping?: Promise<void>

  private queue?: Promise<ComputerExecuteResult>

  private readonly infrastructure: ComputerDriverInfrastructure

  constructor(dependencies: ComputerUseDependencies, infrastructure: ComputerDriverInfrastructure) {
    this.infrastructure = infrastructure
    this.dependencies = dependencies
  }

  async execute(
    action: ComputerAction,
    context: ComputerExecutionContext,
    signal?: AbortSignal,
  ): Promise<ComputerExecuteResult> {
    if (signal?.aborted) {
      return computerDispatchFailure(action, COMPUTER_CANCELLED_MESSAGE, COMPUTER_CANCELLED)
    }
    const safety = computerCheckActionSafety(action, this.dependencies.platform)
    if (safety.kind === COMPUTER_SAFETY_REFUSED) {
      return computerDispatchFailure(action, safety.message, COMPUTER_REFUSED)
    }
    const perform = this.perform.bind(this, action, context, this.generation, signal)
    const run = this.queue ? this.queue.then(perform, perform) : perform()
    this.queue = run
    return run
  }

  private perform(
    action: ComputerAction,
    context: ComputerExecutionContext,
    generation: number,
    signal?: AbortSignal,
  ): Promise<ComputerExecuteResult> {
    return attemptComputer(
      this.executeAction.bind(this, action, context, generation, signal),
      this.executionFailure.bind(this, action),
    )
  }

  private async executeAction(
    action: ComputerAction,
    context: ComputerExecutionContext,
    generation: number,
    signal?: AbortSignal,
  ): Promise<ComputerExecuteResult> {
    if (this.stopping) {
      await this.stopping
    }
    this.requireGeneration(generation)
    if (signal?.aborted) {
      return computerDispatchFailure(action, COMPUTER_CANCELLED_MESSAGE, COMPUTER_CANCELLED)
    }
    const dispatch = await this.getDispatch(generation)
    this.requireGeneration(generation)
    return dispatch.execute(action, context, signal)
  }

  private executionFailure(action: ComputerAction, message: string): ComputerExecuteResult {
    return computerDispatchFailure(action, message, COMPUTER_FAILED)
  }

  diagnose(): Promise<ComputerDiagnostic> {
    return attemptComputer(this.readDriverDiagnostic.bind(this), this.diagnosticFailure.bind(this))
  }

  private async readDriverDiagnostic(): Promise<ComputerDiagnostic> {
    const checked = await this.checkedDriver({ provisionMissing: false })
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

  stop(): Promise<void> {
    if (!this.stopping) {
      this.generation += 1
      const state = this.dispatch
      this.dispatch = { kind: COMPUTER_SESSION_DISPATCH_IDLE }
      this.stopping = this.stopDispatch(state).finally(this.clearStopping.bind(this))
    }
    return this.stopping
  }

  private clearStopping(): void {
    delete this.stopping
  }

  private async stopDispatch(state: ComputerDispatchState): Promise<void> {
    if (state.kind === COMPUTER_SESSION_DISPATCH_ACTIVE) {
      await state.dispatch.stop()
    }
  }

  private requireGeneration(generation: number): void {
    if (generation !== this.generation) {
      throw new Error(COMPUTER_SESSION_STOPPED_MESSAGE)
    }
  }

  private async checkedDriver(request: ComputerDriverLaunchRequest): Promise<ComputerCheckedDriver> {
    const launch = await this.infrastructure.launch(request)
    const manifest = await this.infrastructure.manifest(launch)
    const compatibility = computerCheckDriverVersion(manifest.version)
    if (compatibility.kind !== COMPUTER_DRIVER_COMPATIBLE) {
      throw new Error(compatibility.message)
    }
    return { launch, manifest }
  }

  private async getDispatch(generation: number): Promise<ComputerActionDispatch> {
    const state = this.dispatch
    if (state.kind === COMPUTER_SESSION_DISPATCH_ACTIVE) {
      return state.dispatch
    }
    const checked = await this.checkedDriver({ provisionMissing: true })
    this.requireGeneration(generation)
    const dispatch = this.mountDispatch(checked)
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
