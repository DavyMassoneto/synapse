import { CLIPPED_CONTENT, HEAD_FRACTION } from "./constants"

export function clip(text: string, limit: number): string {
  if (limit <= 0) {
    return ""
  }
  if (text.length <= limit) {
    return text
  }

  if (limit <= CLIPPED_CONTENT.length) {
    return text.slice(0, limit)
  }

  const available = limit - CLIPPED_CONTENT.length
  const head = Math.floor(available * HEAD_FRACTION)
  const tail = available - head
  return text.slice(0, head) + CLIPPED_CONTENT + text.slice(-tail)
}
