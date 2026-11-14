import { type ComputerRawApp } from "../adapters"

export const COMPUTER_RUNNING_APP: ComputerRawApp = { name: "Editor", pid: 10, running: true, bundle_id: "com.editor" }

export const COMPUTER_INSTALLED_APP: ComputerRawApp = {
  name: "Installed",
  pid: 0,
  running: false,
  bundle_id: "com.installed",
}

export const COMPUTER_WINDOW_REFUSAL_MESSAGE = "The requested window is not available; call list_windows."
