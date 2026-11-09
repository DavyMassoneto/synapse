export interface CommandRequest {
  command: string
  args: readonly string[]
  input: string
}

export type CommandRunner = (request: CommandRequest) => string
