import {
  MEMBER_ACTIVITY_TOOL_UPDATE,
  MEMBER_ACTIVITY_UPDATED,
  MEMBER_EXECUTION_ACTIVITY,
  MEMBER_TOOL_ENDED,
  MEMBER_TOOL_STARTED,
  MEMBER_TURN_STARTED,
  type MemberExecutionActivity,
  type MemberSessionEvent,
  type MemberTurnRuntime,
  type TeamClock,
  type TeamObservedSignal,
  type TeamProgress,
} from "#synapse/modules/agent-team/public/contracts"
import { captureObservedTime } from "./capture-time"
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
import { isActiveObservedExecutionEvent } from "./predicates"
import { type ObservedRun, type ObservedTools } from "./types"

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
    const now = captureObservedTime(this.clock, this.runtime)
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
    if (this.run && isActiveObservedExecutionEvent(this.run, event)) {
      switch (event.kind) {
        case MEMBER_TURN_STARTED:
          this.turn(this.run)
          break
        case MEMBER_TOOL_STARTED:
          this.toolStarted(this.run, event.callId, event.label)
          break
        case MEMBER_TOOL_ENDED:
          this.toolEnded(this.run, event.callId)
          break
        case MEMBER_EXECUTION_ACTIVITY:
          this.activity(this.run, event)
          break
      }
    }
  }

  private turn(run: ObservedRun): void {
    run.turns++
    this.record(run, RUN_SIGNAL_TURN)
  }

  private toolStarted(run: ObservedRun, callId: string, name: string): void {
    if (!this.tools.has(callId)) {
      this.tools.set(callId, { name, started: this.runtime.monotonic() })
      this.record(run, RUN_SIGNAL_TOOL_START)
    }
  }

  private toolEnded(run: ObservedRun, callId: string): void {
    if (this.tools.delete(callId)) {
      run.completedTools++
      this.record(run, RUN_SIGNAL_TOOL_END)
    }
  }

  private activity(run: ObservedRun, event: MemberExecutionActivity): void {
    if (event.phase === MEMBER_ACTIVITY_UPDATED) {
      if (event.source === RUN_SIGNAL_STREAM) {
        run.streamUpdates++
      }
      if (event.source) {
        this.record(run, event.source)
      }
    } else if (event.phase === MEMBER_ACTIVITY_TOOL_UPDATE && this.tools.has(event.callId)) {
      this.record(run, RUN_SIGNAL_TOOL_UPDATE)
    }
  }

  finish(): void {
    if (this.run && !this.run.ended) {
      this.record(this.run, RUN_SIGNAL_SETTLED)
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

  private record(run: ObservedRun, signal: TeamObservedSignal): void {
    run.last = captureObservedTime(this.clock, this.runtime)
    run.signal = signal
  }
}
