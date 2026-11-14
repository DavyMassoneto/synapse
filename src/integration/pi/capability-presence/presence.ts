import { CAPABILITY_PRESENCE_SIGNAL } from "./constants"
import { type CapabilityPresenceHost } from "./types"

export class CapabilityPresence {
  private present = false

  private readonly host: CapabilityPresenceHost

  private readonly reply: string

  constructor(host: CapabilityPresenceHost, reply: string) {
    this.host = host
    this.reply = reply
  }

  answer(): void {
    this.host.events.emit(this.reply, CAPABILITY_PRESENCE_SIGNAL)
  }

  markPresent(): void {
    this.present = true
  }

  collect(probe: string): boolean {
    const unsubscribe = this.host.events.on(this.reply, this.markPresent.bind(this))
    try {
      this.host.events.emit(probe, CAPABILITY_PRESENCE_SIGNAL)
      return this.present
    } finally {
      unsubscribe()
    }
  }
}
