import { type ComputerDriverTool } from "#synapse/modules/computer-use/public/contracts"
import { LifecycleInfrastructure } from "./doubles"
import { type LifecycleStartResolver } from "./types"

export class LifecycleStartingDriver extends LifecycleInfrastructure {
  private resolveStart?: LifecycleStartResolver

  readonly pendingStart = new Promise<ComputerDriverTool[]>(this.holdStart.bind(this))

  private holdStart(resolve: LifecycleStartResolver): void {
    this.resolveStart = resolve
  }

  override start(): Promise<ComputerDriverTool[]> {
    this.calls.push("start")
    return this.pendingStart
  }

  releaseStart(): void {
    this.resolveStart?.([])
  }
}
