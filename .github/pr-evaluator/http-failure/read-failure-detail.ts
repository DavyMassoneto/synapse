import { ERROR_BODY_CHARACTERS } from "./constants"

export async function readFailureDetail(response: Response): Promise<string> {
  return (await response.text()).slice(0, ERROR_BODY_CHARACTERS)
}
