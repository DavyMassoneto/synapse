import { NO_TEXT } from "../separators"
import { type CommandRunner } from "../shell"
import { API_ARGUMENTS, INPUT_ARGUMENTS, METHOD_FLAG } from "./constants"
import { runGh } from "./run-gh"
import { type ApiPayload } from "./types"

export async function callApi(
  runner: CommandRunner,
  method: string,
  route: string,
  payload: ApiPayload,
): Promise<void> {
  await runGh(runner, [...API_ARGUMENTS, METHOD_FLAG, method, route, ...INPUT_ARGUMENTS], JSON.stringify(payload))
}

export async function callApiWithoutBody(runner: CommandRunner, method: string, route: string): Promise<void> {
  await runGh(runner, [...API_ARGUMENTS, METHOD_FLAG, method, route], NO_TEXT)
}
