import { NO_TEXT } from "../separators"

export class CommandError extends Error {
  response: string

  constructor(message: string, response?: string) {
    super(message)
    this.response = NO_TEXT
    if (response !== undefined) {
      this.response = response
    }
  }
}
