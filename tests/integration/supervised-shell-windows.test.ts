import { spawn } from "node:child_process"
import { expect, test } from "vitest"
import {
  WINDOWS_PROOF_PLATFORM,
  WINDOWS_PROOF_REJECT_TITLE,
  WINDOWS_PROOF_SCRIPT,
  WINDOWS_PROOF_TIMEOUT_MS,
  WINDOWS_PROOF_TITLE,
  WindowsJobProof,
} from "../fixtures"

async function suspendsAndAssigns(): Promise<void> {
  if (process.platform === WINDOWS_PROOF_PLATFORM) {
    const sentinel = spawn(process.execPath, ["-e", "setInterval(()=>{},1000)"], { stdio: "ignore" })
    try {
      const proof = new WindowsJobProof({
        executable: process.execPath,
        commandLine: `"${process.execPath}" -e "${WINDOWS_PROOF_SCRIPT}"`,
        cwd: process.cwd(),
        failAssignment: false,
      })
      const result = await proof.completion
      expect(result.error).toBe("")
      expect(result.output).toContain("CREATED_SUSPENDED_ASSIGNED")
      expect(result.output).toContain("RELEASED")
      expect(result.code).toBe(93)
      expect(sentinel.exitCode).toBeNull()
    } finally {
      sentinel.kill()
    }
  } else {
    expect(process.platform).not.toBe(WINDOWS_PROOF_PLATFORM)
  }
}

async function refusesBeforeResume(): Promise<void> {
  if (process.platform === WINDOWS_PROOF_PLATFORM) {
    const proof = new WindowsJobProof({
      executable: process.execPath,
      commandLine: `"${process.execPath}" -e "${WINDOWS_PROOF_SCRIPT}"`,
      cwd: process.cwd(),
      failAssignment: true,
    })
    const result = await proof.completion
    expect(result.output).toContain("ASSIGNMENT_REFUSED_BEFORE_RESUME")
    expect(result.output).not.toContain("original-output")
    expect(result.code).toBe(91)
  } else {
    expect(process.platform).not.toBe(WINDOWS_PROOF_PLATFORM)
  }
}

test(WINDOWS_PROOF_TITLE, suspendsAndAssigns, WINDOWS_PROOF_TIMEOUT_MS)
test(WINDOWS_PROOF_REJECT_TITLE, refusesBeforeResume, WINDOWS_PROOF_TIMEOUT_MS)
