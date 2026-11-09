import { type ChangedFile } from "../diff"
import { renderSource } from "./render-source"
import { type Source } from "./types"

export function renderSources(files: ChangedFile[]): Source[] {
  return files.map((file) => renderSource(file))
}
