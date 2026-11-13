import { IPHONE_HTTP_MAX_RESPONSE_BYTES, IPHONE_HTTP_RESPONSE_TOO_LARGE } from "./constants"

export async function readIphoneHttpBody(response: Response): Promise<string> {
  if (!response.body) {
    return ""
  }
  const reader = response.body.getReader()
  const decoder = new TextDecoder()
  const chunks: string[] = []
  let size = 0
  try {
    let result = await reader.read()
    while (!result.done) {
      size += result.value.byteLength
      if (size > IPHONE_HTTP_MAX_RESPONSE_BYTES) {
        await reader.cancel()
        throw new Error(IPHONE_HTTP_RESPONSE_TOO_LARGE)
      }
      chunks.push(decoder.decode(result.value, { stream: true }))
      result = await reader.read()
    }
    chunks.push(decoder.decode())
    return chunks.join("")
  } finally {
    reader.releaseLock()
  }
}
