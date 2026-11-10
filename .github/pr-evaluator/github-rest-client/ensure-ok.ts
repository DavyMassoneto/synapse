import { readFailureDetail } from "#evaluator/http-failure"

export async function ensureOk(response: Response, path: string): Promise<Response> {
  if (response.ok) {
    return response
  }
  throw new Error(`GitHub respondeu ${response.status} em ${path}: ${await readFailureDetail(response)}`)
}
