import { type MessageEndEvent, type MessageEndEventResult } from "@earendil-works/pi-coding-agent"

export type CooldownMessageEndHandler = (event: MessageEndEvent) => MessageEndEventResult

export type CooldownUnsubscribe = () => void

export interface CooldownRetryHost {
  on(event: "message_end", handler: CooldownMessageEndHandler): CooldownUnsubscribe
}
