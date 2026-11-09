import { type CommandRequest } from "#synapse/shell"
import { type Answer } from "./types"

export class RecordedRunner {
  calls: CommandRequest[] = []
  answer: Answer

  constructor(answer: Answer) {
    this.answer = answer
  }

  run(request: CommandRequest): string {
    this.calls.push(request)
    return this.answer(request)
  }
}
