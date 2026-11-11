import { LINE_BREAK } from "./constants"
import { type InspectionItemsPresentation } from "./types"

export function renderInspectionItems(items: Iterable<string>, presentation: InspectionItemsPresentation): string {
  const selected: string[] = []
  for (const item of items) {
    if (selected.length === presentation.maximum) {
      selected.push(presentation.more)
      return selected.join(LINE_BREAK)
    }
    selected.push(item)
  }
  if (selected.length === 0 && presentation.empty) {
    return presentation.empty
  }
  return selected.join(LINE_BREAK)
}
