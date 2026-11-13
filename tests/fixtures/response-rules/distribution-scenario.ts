import { writeFileSync } from "node:fs"
import { join } from "node:path"
import { type PiProcessScenarioHandle, runPiProcessPrompt } from "../pi-process"
import { lastPiProcessUserText, requirePiProcessRequest } from "../request-log"
import { SCRIPTED_PROVIDER_TEXT_KIND } from "../scripted-provider"
import { RESPONSE_RULES_TEST_FILE, RESPONSE_RULES_TEST_PROMPT, RESPONSE_RULES_TEST_REPLY } from "./constants"

export async function piProcessResponseRulesMessage(
  piProcess: PiProcessScenarioHandle,
  instructions: string,
): Promise<string> {
  writeFileSync(join(piProcess.homeDirectory.agentDirectory, RESPONSE_RULES_TEST_FILE), instructions)
  piProcess.homeDirectory.script([{ kind: SCRIPTED_PROVIDER_TEXT_KIND, text: RESPONSE_RULES_TEST_REPLY }])
  const requests = await runPiProcessPrompt(piProcess, RESPONSE_RULES_TEST_PROMPT)
  return lastPiProcessUserText(requirePiProcessRequest(requests, 0))
}
