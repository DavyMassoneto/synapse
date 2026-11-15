import { SUPERVISED_BURST_LOG_SEPARATOR, SUPERVISED_BURST_PHASE_SEPARATOR } from "./constants"

export class BurstTiming {
  private readonly began = performance.now()
  private readonly index: number

  constructor(index: number) {
    this.index = index
  }

  record(phase: string): void {
    process.stderr.write(
      [this.index, phase, performance.now() - this.began, SUPERVISED_BURST_PHASE_SEPARATOR].join(
        SUPERVISED_BURST_LOG_SEPARATOR,
      ),
    )
  }
}
