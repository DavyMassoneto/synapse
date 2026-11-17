import { type MemberSessionEvent } from "#synapse/modules/agent-team"

export type QueueEvents = MemberSessionEvent[]

export type QueueBarrierEvent = "input" | "agent_settled"

export type QueueBarrierRelease = () => void
