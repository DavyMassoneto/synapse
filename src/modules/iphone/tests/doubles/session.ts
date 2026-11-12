import { type IphoneSessionDouble } from "./types"

export class TestIphoneSession implements IphoneSessionDouble {
  probes = 0

  closes = 0

  failProbe = false

  async probe(signal: AbortSignal): Promise<void> {
    signal.throwIfAborted()
    this.probes++
    if (this.failProbe) {
      throw new Error("sonda falhou")
    }
  }

  async dispose(): Promise<void> {
    this.closes++
  }
}
