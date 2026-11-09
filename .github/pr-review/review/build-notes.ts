import { LIST_SEPARATOR } from "../separators"
import { type Source } from "../source"
import { fillTemplate } from "../templates"
import { NOTE_INCOMPLETE_CHUNK, NOTE_INCOMPLETE_FILES } from "./constants"
import { type ChunkOutcome, MAX_ROUNDS } from "./rounds"

export function buildNotes(outcome: ChunkOutcome, sources: Source[]): string[] {
  const notes: string[] = []
  if (!outcome.complete) {
    notes.push(fillTemplate(NOTE_INCOMPLETE_CHUNK, [String(MAX_ROUNDS)]))
  }
  const incomplete = sources.filter((source) => source.incomplete).map((source) => source.path)
  if (incomplete.length > 0) {
    notes.push(fillTemplate(NOTE_INCOMPLETE_FILES, [incomplete.join(LIST_SEPARATOR)]))
  }
  return notes
}
