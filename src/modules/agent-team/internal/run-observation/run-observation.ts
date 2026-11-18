import {
  MEMBER_ACTIVITY_TOOL_UPDATE,
  MEMBER_ACTIVITY_UPDATED,
  MEMBER_ASSISTANT_RESPONSE,
  MEMBER_EXECUTION_ACTIVITY,
  MEMBER_TOOL_ENDED,
  MEMBER_TOOL_STARTED,
  MEMBER_TURN_STARTED,
  type MemberExecutionActivity,
  type MemberSessionEvent,
  type MemberTurnRuntime,
  type TeamClock,
  type TeamProgress,
} from "#synapse/modules/agent-team/public/contracts"
import {
  RUN_OBSERVATION_KNOWN,
  RUN_OBSERVATION_UNKNOWN,
  RUN_SIGNAL_SETTLED,
  RUN_SIGNAL_START,
  RUN_SIGNAL_STREAM,
  RUN_SIGNAL_TOOL_END,
  RUN_SIGNAL_TOOL_START,
  RUN_SIGNAL_TOOL_UPDATE,
  RUN_SIGNAL_TURN,
} from "./constants"
import { type ObservedRun, type ObservedTime, type ObservedTools } from "./types"

export class MemberRunObservation {
  private run?: ObservedRun

  private readonly tools: ObservedTools = new Map()

  private readonly runtime: MemberTurnRuntime

  private readonly clock: TeamClock

  constructor(runtime: MemberTurnRuntime, clock: TeamClock) {
    this.runtime = runtime
    this.clock = clock
  }

  start(executionId: number): void {
    const now = this.now()
    this.run = {
      executionId,
      started: now,
      last: now,
      signal: RUN_SIGNAL_START,
      turns: 0,
      completedTools: 0,
      streamUpdates: 0,
    }
    this.tools.clear()
  }

  observe(event: MemberSessionEvent): void {
    if (
      this.run &&
      !this.run.ended &&
      event.kind !== MEMBER_ASSISTANT_RESPONSE &&
      event.executionId === this.run.executionId
    ) {
      switch (event.kind) {
        case MEMBER_TURN_STARTED:
          this.turn()
          break
        case MEMBER_TOOL_STARTED:
          this.toolStarted(event.callId, event.label)
          break
        case MEMBER_TOOL_ENDED:
          this.toolEnded(event.callId)
          break
        case MEMBER_EXECUTION_ACTIVITY:
          this.activity(event)
          break
      }
    }
  }

  private turn(): void {
    if (this.run && !this.run.ended) {
      this.run.turns++
      this.record(RUN_SIGNAL_TURN)
    }
  }

  private toolStarted(callId: string, name: string): void {
    if (this.run && !this.run.ended && !this.tools.has(callId)) {
      this.tools.set(callId, { name, started: this.runtime.monotonic() })
      this.record(RUN_SIGNAL_TOOL_START)
    }
  }

  private toolEnded(callId: string): void {
    if (this.run && !this.run.ended && this.tools.delete(callId)) {
      this.run.completedTools++
      this.record(RUN_SIGNAL_TOOL_END)
    }
  }

  private activity(event: MemberExecutionActivity): void {
    if (this.run && !this.run.ended && event.executionId === this.run.executionId) {
      if (event.phase === MEMBER_ACTIVITY_UPDATED) {
        if (event.source === RUN_SIGNAL_STREAM) {
          this.run.streamUpdates++
        }
        if (event.source) {
          this.record(event.source)
        }
      } else if (event.phase === MEMBER_ACTIVITY_TOOL_UPDATE && this.tools.has(event.callId)) {
        this.record(RUN_SIGNAL_TOOL_UPDATE)
      }
    }
  }

  finish(): void {
    if (this.run && !this.run.ended) {
      this.record(RUN_SIGNAL_SETTLED)
      this.run.ended = this.run.last
      this.tools.clear()
    }
  }

  snapshot(): TeamProgress {
    if (!this.run) {
      return { kind: RUN_OBSERVATION_UNKNOWN }
    }
    const now = this.runtime.monotonic()
    let end = now
    if (this.run.ended) {
      end = this.run.ended.monotonic
    }
    return {
      kind: RUN_OBSERVATION_KNOWN,
      executionId: this.run.executionId,
      startedAt: this.run.started.timestamp,
      elapsedMs: Math.max(0, end - this.run.started.monotonic),
      lastSignalAt: this.run.last.timestamp,
      silentMs: Math.max(0, now - this.run.last.monotonic),
      lastSignal: this.run.signal,
      turns: this.run.turns,
      completedTools: this.run.completedTools,
      streamUpdates: this.run.streamUpdates,
      tools: Array.from(this.tools.values(), (tool) => ({
        name: tool.name,
        elapsedMs: Math.max(0, now - tool.started),
      })),
    }
  }

  private now(): ObservedTime {
    return { timestamp: this.clock(), monotonic: this.runtime.monotonic() }
  }

  private record(signal: string): void {
    if (this.run) {
      this.run.last = this.now()
      this.run.signal = signal
    }
  }
}
