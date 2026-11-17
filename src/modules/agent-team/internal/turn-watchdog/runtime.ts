import {
  type MemberTimerCallback,
  type MemberTimerCancel,
  type MemberTurnRuntime,
} from "#synapse/modules/agent-team/public/contracts"

export function createMemberTurnRuntime(): MemberTurnRuntime {
  return { monotonic: performance.now.bind(performance), schedule: scheduleMemberTurnCheck }
}

function scheduleMemberTurnCheck(callback: MemberTimerCallback, delayMs: number): MemberTimerCancel {
  const timer = setTimeout(callback, delayMs)
  timer.unref()
  return clearTimeout.bind(undefined, timer)
}
