import { type ChatMessage } from "./request"

export type ModelCaller = (messages: ChatMessage[]) => Promise<string>
