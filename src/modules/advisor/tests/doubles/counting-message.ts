import { type TranscriptBlock, type UserTranscript } from "#synapse/modules/advisor"

export class CountingUserMessage implements UserTranscript {
  readonly kind = "user"
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
