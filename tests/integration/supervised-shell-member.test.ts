import { execFileSync } from "node:child_process"
import { mkdtempSync, readFileSync, rmSync } from "node:fs"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { getShellConfig } from "@earendil-works/pi-coding-agent"
import { expect, test } from "vitest"
import { PiTeamSessionAdapter } from "#synapse/integration/pi/agent-team"
import { SupervisedMemberLifetime } from "#synapse/integration/pi/agent-team/supervised-bash"
import { createSupervisedShell } from "#synapse/modules/agent-team/public/supervised-shell"
import {
  SUPERVISED_TEST_BACKGROUND_INTERRUPT_TITLE,
  SUPERVISED_TEST_BACKGROUND_PID_FILE,
  SUPERVISED_TEST_BACKGROUND_TEMP,
  SUPERVISED_TEST_INTERRUPT_TITLE,
  SUPERVISED_TEST_TIMEOUT_MS,
  SUPERVISED_TEST_WINDOWS,
  SupervisedTestOutput,
  TeamSessionDouble,
} from "../fixtures"

async function memberInterruptKillsShell(): Promise<void> {
  const shell = createSupervisedShell()
  const port = new TeamSessionDouble()
  const lifetime = new SupervisedMemberLifetime(port, shell)
  const adapter = new PiTeamSessionAdapter(port, lifetime)
  const configured = getShellConfig()
  const lease = await shell.create(
    {
      executable: configured.shell,
      arguments: [...configured.args, "sleep 20"],
      cwd: process.cwd(),
      environment: process.env,
    },
    new SupervisedTestOutput(),
  )
  lease.release()
  try {
    await adapter.abort()
    expect(lease.state).toBe("exited")
    expect(port.aborted).toBe(true)
  } finally {
    await adapter.dispose()
  }
}

async function backgroundSurvivesResult(): Promise<void> {
  const directory = mkdtempSync(join(tmpdir(), SUPERVISED_TEST_BACKGROUND_TEMP))
  const file = join(directory, SUPERVISED_TEST_BACKGROUND_PID_FILE)
  const shell = createSupervisedShell()
  const output = new SupervisedTestOutput()
  const lease = await shell.create(
    {
      executable: "/bin/bash",
      arguments: ["-c", `sleep 30 & printf '%s' $! > '${file}'; exit 7`],
      cwd: directory,
      environment: process.env,
    },
    output,
  )
  try {
    lease.release()
    expect(await lease.completion).toBe(7)
    const pid = Number(readFileSync(file, "utf8"))
    const before = execFileSync("/bin/ps", ["-p", String(pid), "-o", "pid="], { encoding: "utf8" })
    expect(before.trim()).toBe(String(pid))
    expect(lease.state).toBe("released")
    const port = new TeamSessionDouble()
    const adapter = new PiTeamSessionAdapter(port, new SupervisedMemberLifetime(port, shell))
    await adapter.abort()
    expect(lease.state).toBe("exited")
    expect(execFileSync("/bin/ps", ["-axo", "pid="], { encoding: "utf8" }).split("\n").map(Number)).not.toContain(pid)
  } finally {
    await shell.close()
    rmSync(directory, { recursive: true, force: true })
  }
}

test(SUPERVISED_TEST_INTERRUPT_TITLE, memberInterruptKillsShell, SUPERVISED_TEST_TIMEOUT_MS)

test.skipIf(process.platform === SUPERVISED_TEST_WINDOWS)(
  SUPERVISED_TEST_BACKGROUND_INTERRUPT_TITLE,
  backgroundSurvivesResult,
  SUPERVISED_TEST_TIMEOUT_MS,
)
