import { type ChatMessage } from "#synapse/client"

export class ScriptedCaller {
  replies: string[]
  received: ChatMessage[][] = []

  constructor(replies: string[]) {
    this.replies = [...replies]
  }

  call(messages: ChatMessage[]): Promise<string> {
    this.received.push(messages.map((message) => ({ ...message })))
    const reply = this.replies.shift()
    if (reply === undefined) {
      return Promise.reject(new Error("sem resposta roteirizada"))
    }
    return Promise.resolve(reply)
  }
}
