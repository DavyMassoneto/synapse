import { type ToolResultTranscript, type TranscriptBlock } from "#synapse/modules/advisor"

export class CountingToolResult implements ToolResultTranscript {
  readonly kind = "toolResult"
  readonly tool = "read"
  readonly error = false
  reads = 0
  private readonly $content: TranscriptBlock[]

  constructor(content: TranscriptBlock[]) {
    this.$content = content
  }

  get blocks(): TranscriptBlock[] {
    this.reads += 1
    return this.$content
  }
}
