import { writeFileSync } from "node:fs"
import { join } from "node:path"
import { describe, expect, test } from "vitest"
import {
  IPHONE_FIXTURE_CONFIG_FILE,
  IPHONE_FIXTURE_ENCODING,
  IPHONE_FIXTURE_PROMPT,
  IPHONE_FIXTURE_REPLY,
  IphoneFixtureServer,
  PI_PROCESS_COMMAND_TIMEOUT_MS,
  PI_PROCESS_SETTLED_EVENT,
  PI_PROCESS_TEXT_KIND,
  PI_PROCESS_TIMEOUT_MS,
  PI_PROCESS_TOOL_CALL_KIND,
  type PiProcessScenarioHandle,
  readPiProcessRequests,
  resolvePiProcessEntrypoint,
  runWithPiProcess,
} from "../fixtures"

async function callsIphone(pi: PiProcessScenarioHandle): Promise<void> {
  const server = new IphoneFixtureServer()
  const serverUrl = await server.start()
  try {
    writeFileSync(
      join(pi.homeDirectory.agentDirectory, IPHONE_FIXTURE_CONFIG_FILE),
      JSON.stringify({
        serverUrl,
        target: {
          kind: "device",
          udid: "fake-explicit",
          deviceName: "Fake",
          platformVersion: "26.0",
          wdaInstalled: true,
        },
      }),
      IPHONE_FIXTURE_ENCODING,
    )
    pi.homeDirectory.script([
      { kind: PI_PROCESS_TOOL_CALL_KIND, name: "iphone", argumentsJson: '{"action":"tree"}' },
      { kind: PI_PROCESS_TEXT_KIND, text: IPHONE_FIXTURE_REPLY },
    ])
    pi.start(resolvePiProcessEntrypoint())
    await pi.command({ type: "prompt", message: IPHONE_FIXTURE_PROMPT })
    await pi.received.waitFor(PI_PROCESS_SETTLED_EVENT, PI_PROCESS_COMMAND_TIMEOUT_MS)
    expect(readPiProcessRequests(pi.homeDirectory.home)).toHaveLength(2)
    expect(server.paths).toContain("/session/fake/source")
  } finally {
    await server.stop()
  }
}

function suite(): void {
  test(
    "pacote executa iphone contra WebDriver falso e recebe resultado",
    runWithPiProcess.bind(undefined, callsIphone),
    PI_PROCESS_TIMEOUT_MS,
  )
}

describe("distribuição iPhone", suite)
