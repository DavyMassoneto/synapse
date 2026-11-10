import { readFailureDetail } from "#evaluator/http-failure"
import { ModelHttpError } from "./model-http-error"

export async function ensureSuccess(response: Response): Promise<Response> {
  if (response.ok) {
    return response
  }
  throw new ModelHttpError(response.status, `Modelo respondeu ${response.status}: ${await readFailureDetail(response)}`)
}
