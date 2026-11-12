import { TestIphoneSession } from "./session"
import { type IphoneFactoryDouble, type IphoneSessionDouble } from "./types"

export class TestIphoneFactory implements IphoneFactoryDouble {
  creates = 0

  stops = 0

  session: IphoneSessionDouble = new TestIphoneSession()

  async create(signal: AbortSignal): Promise<IphoneSessionDouble> {
    signal.throwIfAborted()
    this.creates++
    return this.session
  }

  async stop(): Promise<void> {
    this.stops++
  }
}
