export function requireBody(response: Response): ReadableStream<Uint8Array> {
  if (response.body instanceof ReadableStream) {
    return response.body
  }
  throw new Error("O modelo respondeu sem corpo")
}
