import { setTimeout } from "node:timers/promises"
import { createModelCaller } from "../client"
import { loadSettings } from "../settings"
import { runCommand } from "../shell"
import { type Execution } from "./types"

export function createExecution(): Execution {
  const settings = loadSettings()
  return {
    settings,
    ports: {
      runner: runCommand,
      caller: createModelCaller(settings),
      timing: {
        now: Date.now,
        wait: async (milliseconds: number) => {
          await setTimeout(milliseconds)
        },
        hasMutation: false,
      },
    },
  }
}
