import { type PiProcessModelSelection } from "../model-selection"
import { type PiProcessScenarioHandle, runPiProcessPrompt } from "../pi-process"
import { PI_PROCESS_TEXT_KIND } from "../scripted-provider"
import { ROUTER_TEST_PROMPT, ROUTER_TEST_REPLY } from "./constants"

export async function runPiRouterScenario(
  piProcess: PiProcessScenarioHandle,
  selection: PiProcessModelSelection,
): Promise<void> {
  piProcess.homeDirectory.script([{ kind: PI_PROCESS_TEXT_KIND, text: ROUTER_TEST_REPLY }])
  piProcess.configureSelection(selection)
  await runPiProcessPrompt(piProcess, ROUTER_TEST_PROMPT)
}
