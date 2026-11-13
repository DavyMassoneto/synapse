import { ROUTER_CLIP_CHAR_DIVISOR, ROUTER_CLIP_RESERVE_BYTES, ROUTER_OMISSION_MARKER } from "./constants"

export function boundRouterText(text: string, bytes: number): string {
  if (Buffer.byteLength(text) <= bytes) {
    return text
  }
  const chars = Math.max(0, Math.floor((bytes - ROUTER_CLIP_RESERVE_BYTES) / ROUTER_CLIP_CHAR_DIVISOR))
  return text.slice(0, chars) + ROUTER_OMISSION_MARKER + text.slice(text.length - chars)
}
