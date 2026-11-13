import { setTimeout as sleep } from "node:timers/promises"
import { TEAM_WAIT_COMPLETED, type TeamWaitResult } from "#synapse/modules/agent-team/public/contracts"

export class Inbox {
  private readonly waiting = new Set<AbortController>()

  private arrivals = 0

  private reported = 0

  get hasWaiter(): boolean {
    return this.waiting.size > 0
  }

  arrive(): void {
    this.arrivals += 1
    for (const arrival of this.waiting) {
      arrival.abort()
    }
  }

  markSeen(): void {
    this.reported = this.arrivals
  }

  close(): void {
    this.arrive()
    this.markSeen()
  }

  async wait(timeoutMs: number, signal?: AbortSignal): Promise<TeamWaitResult> {
    if (this.arrivals > this.reported) {
      this.markSeen()
      return { kind: TEAM_WAIT_COMPLETED, timedOut: false }
    }
    const arrival = new AbortController()
    this.waiting.add(arrival)
    try {
      await sleep(timeoutMs, true, { signal: this.waitSignal(arrival, signal) })
      return { kind: TEAM_WAIT_COMPLETED, timedOut: true }
    } catch (error) {
      if (arrival.signal.aborted) {
        this.markSeen()
        return { kind: TEAM_WAIT_COMPLETED, timedOut: false }
      }
      throw error
    } finally {
      this.waiting.delete(arrival)
    }
  }

  private waitSignal(arrival: AbortController, signal?: AbortSignal): AbortSignal {
    if (signal) {
      return AbortSignal.any([arrival.signal, signal])
    }
    return arrival.signal
  }
}
