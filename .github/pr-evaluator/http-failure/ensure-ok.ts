import { ERROR_BODY_CHARACTERS } from "./constants"
import { HttpFailure } from "./http-failure"

async function readFailureDetail(response: Response): Promise<string> {
  const decoder = new TextDecoder()
  let detail = ""
  if (response.body) {
    for await (const bytes of response.body) {
      detail += decoder.decode(bytes, { stream: true })
      if (detail.length >= ERROR_BODY_CHARACTERS) {
        break
      }
    }
  }
  return detail.slice(0, ERROR_BODY_CHARACTERS)
}

export async function ensureOk(response: Response, origin: string): Promise<Response> {
  if (response.ok) {
    return response
  }
  throw new HttpFailure(response.status, `${origin} respondeu ${response.status}: ${await readFailureDetail(response)}`)
}
