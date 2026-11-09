import { expect, test } from "vitest"
import { CommandError } from "#synapse/errors"
import { runCommand, runGit } from "#synapse/shell"
import { RecordedRunner } from "#synapse/tests/fixtures"

test("disables git path quoting for non-ASCII paths", () => {
  const recorded = new RecordedRunner((request) => {
    expect(request.command).toBe("git")
    expect(request.args).toEqual(["-c", "core.quotepath=false", "ls-files"])
    return "café.ts\n"
  })
  expect(runGit(recorded.run.bind(recorded), ["ls-files"])).toBe("café.ts\n")
})

test("returns command stdout", () => {
  expect(runCommand({ command: process.execPath, args: ["-e", 'process.stdout.write("ok")'], input: "" })).toBe("ok")
})

test("preserves failure stdout in CommandError for included HTTP headers", () => {
  try {
    runCommand({
      command: process.execPath,
      args: [
        "-e",
        'process.stdout.write("HTTP/2.0 403 Forbidden\\r\\nRetry-After: 120\\r\\n\\r\\n{}");process.exit(3)',
      ],
      input: "",
    })
    expect.fail("expected command failure")
  } catch (error) {
    expect(error).toBeInstanceOf(CommandError)
    if (error instanceof CommandError) {
      expect(error.response).toContain("Retry-After: 120")
    }
  }
})
