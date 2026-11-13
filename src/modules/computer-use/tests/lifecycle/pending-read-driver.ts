import {
  COMPUTER_DRIVER_DISCONNECTED,
  type ComputerDriverArguments,
  type ComputerDriverCallResult,
} from "#synapse/modules/computer-use/public/contracts"
import { LifecycleInfrastructure } from "./doubles"
import { type LifecycleCallResolver, type LifecycleReadStartedResolver } from "./types"

export class LifecyclePendingReadDriver extends LifecycleInfrastructure {
  private resolveRequested?: LifecycleReadStartedResolver

  readonly requested = new Promise<void>(this.holdRequested.bind(this))

  private holdRequested(resolve: LifecycleReadStartedResolver): void {
    this.resolveRequested = resolve
  }

  private resolveRead?: LifecycleCallResolver

  readonly reading = new Promise<ComputerDriverCallResult>(this.holdRead.bind(this))

  private holdRead(resolve: LifecycleCallResolver): void {
    this.resolveRead = resolve
  }

  override call(name: string, argumentsValue: ComputerDriverArguments): Promise<ComputerDriverCallResult> {
    if (name === "list_windows") {
      this.calls.push(name)
      this.resolveRequested?.()
      return this.reading
    }
    return super.call(name, argumentsValue)
  }

  disconnectRead(): void {
    this.resolveRead?.({ kind: COMPUTER_DRIVER_DISCONNECTED, message: "parado" })
  }
}
