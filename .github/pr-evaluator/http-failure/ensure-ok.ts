import { ERROR_BODY_CHARACTERS } from "./constants"
import { HttpFailure } from "./http-failure"

export async function ensureOk(response: Response, origin: string): Promise<Response> {
  if (response.ok) {
    return response
  }
  const detail = (await response.text()).slice(0, ERROR_BODY_CHARACTERS)
  throw new HttpFailure(response.status, `${origin} respondeu ${response.status}: ${detail}`)
}
