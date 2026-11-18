import { appendFileSync } from "node:fs"
import { type ExtensionAPI, type ExtensionContext } from "@earendil-works/pi-coding-agent"
import {
  TREE_PROBE_MISSING,
  TREE_PROBE_NEWLINE,
  TREE_PROBE_SHUTDOWN,
  TREE_PROBE_SHUTDOWN_PREFIX,
  TREE_PROBE_START,
  TREE_PROBE_START_PREFIX,
  TREE_PROBE_VARIABLE,
} from "./constants"
import { type TreeProbeEvent } from "./types"

function recordLifecycle(prefix: string, _event: TreeProbeEvent, context: ExtensionContext): void {
  const path = process.env[TREE_PROBE_VARIABLE]
  if (!path) {
    throw new Error(TREE_PROBE_MISSING)
  }
  appendFileSync(path, prefix + context.sessionManager.getSessionId() + TREE_PROBE_NEWLINE)
}

export default function registerTreeProbe(pi: ExtensionAPI): void {
  pi.on(TREE_PROBE_START, recordLifecycle.bind(null, TREE_PROBE_START_PREFIX))
  pi.on(TREE_PROBE_SHUTDOWN, recordLifecycle.bind(null, TREE_PROBE_SHUTDOWN_PREFIX))
}
