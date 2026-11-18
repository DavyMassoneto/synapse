import { type SessionShutdownEvent, type SessionStartEvent } from "@earendil-works/pi-coding-agent"

export type TreeProbeEvent = SessionStartEvent | SessionShutdownEvent
