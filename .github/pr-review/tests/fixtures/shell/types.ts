import { type CommandRequest } from "#synapse/shell"

export type Answer = (request: CommandRequest) => string
