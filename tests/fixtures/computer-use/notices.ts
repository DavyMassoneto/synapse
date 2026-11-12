import { type PiComputerCommandContext } from "#synapse/integration"

export class ComputerIntegrationNotices implements PiComputerCommandContext {
  readonly messages: string[] = []

  readonly ui = { notify: this.notify.bind(this) }

  private notify(message: string): void {
    this.messages.push(message)
  }
}
