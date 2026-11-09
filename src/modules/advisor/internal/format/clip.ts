import { CLIPPED_CONTENT, HEAD_FRACTION } from "./constants"

export function clip(text: string, limit: number): string {
  if (limit <= 0) {
    return ""
  }
  if (text.length <= limit) {
    return text
  }

  const marker = CLIPPED_CONTENT
  if (limit <= marker.length) {
    return text.slice(0, limit)
  }

  const available = limit - marker.length
  const head = Math.floor(available * HEAD_FRACTION)
  const tail = available - head
  return text.slice(0, head) + marker + text.slice(-tail)
}
