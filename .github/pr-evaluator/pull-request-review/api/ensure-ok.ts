import { ERROR_BODY_CHARACTERS } from "./constants"

export async function ensureOk(response: Response, path: string): Promise<Response> {
  if (response.ok) {
    return response
  }
  const detail = (await response.text()).slice(0, ERROR_BODY_CHARACTERS)
  throw new Error(`GitHub respondeu ${response.status} em ${path}: ${detail}`)
}
