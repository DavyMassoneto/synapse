export class IphoneFixtureUI {
  messages: string[] = []

  notify(message: string): void {
    this.messages.push(message)
  }
}
