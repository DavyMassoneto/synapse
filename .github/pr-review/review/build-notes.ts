import { LIST_SEPARATOR } from "../separators"
import { type Source } from "../source"
import { fillTemplate } from "../templates"
import { NOTE_INCOMPLETE_CHUNK, NOTE_INCOMPLETE_FILES, NOTE_SKIPPED } from "./constants"
import { type ChunkOutcome, MAX_ROUNDS } from "./rounds"

export function buildNotes(outcomes: ChunkOutcome[], skipped: number, sources: Source[]): string[] {
  const notes: string[] = []
  outcomes.forEach((outcome, index) => {
    if (!outcome.complete) {
      notes.push(fillTemplate(NOTE_INCOMPLETE_CHUNK, [String(index + 1), String(MAX_ROUNDS)]))
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
