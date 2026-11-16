import { expect, test } from "vitest"
import {
  SUPERVISED_BASH_ABORTED,
  SupervisedBashDeadline,
  SupervisedBashExecution,
} from "#synapse/integration/pi/agent-team/supervised-bash"
import { CancelledResultShell, SUPERVISED_TEST_STOP_RACE_TITLE } from "../fixtures"

async function abortWinsOutputMicrotask(): Promise<void> {
  const shell = new CancelledResultShell()
  const deadline = new SupervisedBashDeadline()
  const execution = new SupervisedBashExecution(shell, deadline)
  const result = execution.run()
  deadline.abort()
  shell.finish(false)
  await Promise.resolve()
  shell.loseOutput()
  await expect(result).rejects.toThrow(SUPERVISED_BASH_ABORTED)
}

test(SUPERVISED_TEST_STOP_RACE_TITLE, abortWinsOutputMicrotask)
