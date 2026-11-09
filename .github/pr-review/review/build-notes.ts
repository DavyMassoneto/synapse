import { LIST_SEPARATOR } from "../separators"
import { type Source } from "../source"
import { fillTemplate } from "../templates"
import { MAX_ROUNDS, NOTE_INCOMPLETE_FILES, NOTE_INCOMPLETE_PART, NOTE_SKIPPED } from "./constants"
import { type ChunkOutcome } from "./types"

export function buildNotes(outcomes: ChunkOutcome[], skipped: number, sources: Source[]): string[] {
  const notes: string[] = []
  outcomes.forEach((outcome, index) => {
    if (!outcome.complete) {
      notes.push(fillTemplate(NOTE_INCOMPLETE_PART, [String(index + 1), String(MAX_ROUNDS)]))
    }
  })
  if (skipped > 0) {
    notes.push(fillTemplate(NOTE_SKIPPED, [String(skipped)]))
  }
  const incomplete = sources.filter((source) => source.incomplete).map((source) => source.path)
  if (incomplete.length > 0) {
    notes.push(fillTemplate(NOTE_INCOMPLETE_FILES, [incomplete.join(LIST_SEPARATOR)]))
  }
  return notes
}
