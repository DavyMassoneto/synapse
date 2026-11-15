import {
  type ComputerRawEnvelope,
  type ComputerRawState,
} from "#synapse/modules/computer-use/adapters/driver-response-validation"
import {
  COMPUTER_BOUNDS_KNOWN,
  COMPUTER_PNG_MIME,
  type ComputerWindow,
} from "#synapse/modules/computer-use/public/contracts"

export const COMPUTER_CURRENT_MM_APP = "MM.exe"

export const COMPUTER_CURRENT_MM_PID = 28096

export const COMPUTER_CURRENT_MM_WINDOW_ID = 4459650

export const COMPUTER_CURRENT_MM_WINDOW_TITLE = "Motorsport Manager"

export const COMPUTER_CURRENT_MM_CAPTURE_TEXT =
  'window_id=4459650 pid=28096 elements=5 snapshot_id=s0000001e\n\n(tree is in structuredContent.elements; pass tree_format "markdown" for the compact text rendering)'

export const COMPUTER_CURRENT_MM_SCREENSHOT_BASE64 =
  "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"

export const COMPUTER_CURRENT_INVALID_WINDOW_MESSAGE =
  'No window with window_id 999999 exists. Call `list_windows({"pid": 28096})` for candidates.'

export const COMPUTER_CURRENT_BACKGROUND_UNAVAILABLE_MESSAGE =
  'Background input could not be delivered by the coordinate actuator; retry this action with delivery_mode:"foreground".'

export const COMPUTER_CURRENT_CLICK_SUMMARY = "✅ Posted click to pid 28096."

export const COMPUTER_CURRENT_REFUSED_MESSAGE = "element_token belongs to a superseded snapshot."

export function computerCurrentMmWindow(): ComputerWindow {
  return {
    app: COMPUTER_CURRENT_MM_APP,
    pid: COMPUTER_CURRENT_MM_PID,
    windowId: COMPUTER_CURRENT_MM_WINDOW_ID,
    onScreen: true,
    title: COMPUTER_CURRENT_MM_WINDOW_TITLE,
    zIndex: 1,
    bounds: {
      kind: COMPUTER_BOUNDS_KNOWN,
      rectangle: { x: 420, y: 152, width: 1796, height: 998 },
    },
  }
}

export function computerCurrentMmCaptureState(): ComputerRawState {
  return {
    app_name: COMPUTER_CURRENT_MM_APP,
    capture_id: "capture_992cb79edd1f43a5a3b1989cb7196bbc_000000000000001b",
    element_count: 5,
    elements: [
      {
        actions: ["set_value"],
        depth: 1,
        element_index: 0,
        element_token: "s0000001e:0",
        enabled: true,
        frame: { h: 23, w: 1794, x: 421, y: 155 },
        label: COMPUTER_CURRENT_MM_WINDOW_TITLE,
        role: "TitleBar",
        screenshot_frame: { h: 18, w: 32, x: 0, y: 0 },
        value: COMPUTER_CURRENT_MM_WINDOW_TITLE,
      },
      {
        actions: ["invoke", "expand"],
        depth: 3,
        element_index: 1,
        element_token: "s0000001e:1",
        enabled: true,
        frame: { h: 22, w: 22, x: 426, y: 160 },
        label: "Sistema",
        parent_index: 0,
        role: "MenuItem",
        screenshot_frame: { h: 1, w: 1, x: 0, y: 0 },
      },
      {
        actions: ["invoke"],
        depth: 2,
        element_index: 2,
        element_token: "s0000001e:2",
        enabled: true,
        frame: { h: 25, w: 47, x: 2076, y: 153 },
        label: "Minimizar",
        parent_index: 0,
        role: "Button",
        screenshot_frame: { h: 1, w: 1, x: 0, y: 0 },
      },
      {
        actions: ["invoke"],
        depth: 2,
        element_index: 3,
        element_token: "s0000001e:3",
        enabled: false,
        frame: { h: 25, w: 46, x: 2123, y: 153 },
        label: "Maximizar",
        parent_index: 0,
        role: "Button",
        screenshot_frame: { h: 1, w: 1, x: 0, y: 0 },
      },
      {
        actions: ["invoke"],
        depth: 2,
        element_index: 4,
        element_token: "s0000001e:4",
        enabled: true,
        frame: { h: 25, w: 47, x: 2169, y: 153 },
        label: "Fechar",
        parent_index: 0,
        role: "Button",
        screenshot_frame: { h: 1, w: 1, x: 0, y: 0 },
      },
    ],
    elements_complete: true,
    pid: COMPUTER_CURRENT_MM_PID,
    returned_element_count: 5,
    screenshot_height: 18,
    screenshot_mime_type: COMPUTER_PNG_MIME,
    screenshot_width: 32,
    snapshot_id: "s0000001e",
    timeout_ms: 1000,
    total_element_count: 5,
    tree_format: "elements",
    truncated: false,
    window_bounds: { height: 998, width: 1796, x: 420, y: 152 },
    window_id: COMPUTER_CURRENT_MM_WINDOW_ID,
    window_title: COMPUTER_CURRENT_MM_WINDOW_TITLE,
  }
}

export function computerCurrentMmElementState(index: number): ComputerRawState {
  const state = computerCurrentMmCaptureState()
  const element = state.elements?.[0]
  if (element) {
    element.element_index = index
  }
  return state
}

export function computerCurrentMmCaptureEnvelope(): ComputerRawEnvelope {
  return {
    content: [
      { type: "text", text: COMPUTER_CURRENT_MM_CAPTURE_TEXT },
      { type: "image", data: COMPUTER_CURRENT_MM_SCREENSHOT_BASE64, mimeType: COMPUTER_PNG_MIME },
    ],
    structuredContent: computerCurrentMmCaptureState(),
  }
}

export function computerCurrentInvalidWindowEnvelope(): ComputerRawEnvelope {
  return {
    content: [{ type: "text", text: COMPUTER_CURRENT_INVALID_WINDOW_MESSAGE }],
    structuredContent: { code: "tool_invocation_failed" },
    isError: true,
  }
}

export function computerCurrentBackgroundUnavailableEnvelope(): ComputerRawEnvelope {
  return {
    content: [{ type: "text", text: COMPUTER_CURRENT_BACKGROUND_UNAVAILABLE_MESSAGE }],
    structuredContent: {
      code: "background_unavailable",
      delivery: { mode: "background" },
      escalation: { recommended: "foreground", reason: "occluded / known-dropped event kind" },
      hint: 'Retry this action with delivery_mode:"foreground".',
      route: "synthetic_events",
    },
    isError: true,
  }
}

export function computerCurrentClickSummaryEnvelope(): ComputerRawEnvelope {
  return {
    content: [],
    structuredContent: {
      delivery: { mode: "background" },
      effect: "unverifiable",
      hint: "Read what changed before clicking again.",
      route: "synthetic_events",
      summary: COMPUTER_CURRENT_CLICK_SUMMARY,
    },
  }
}

export function computerCurrentRefusedEnvelope(): ComputerRawEnvelope {
  return {
    content: [],
    structuredContent: {
      effect: "refused",
      error: {
        code: "stale_element_token",
        hint: "Call get_window_state again.",
        message: COMPUTER_CURRENT_REFUSED_MESSAGE,
      },
      route: "accessibility",
    },
  }
}

export function computerCurrentAppsState(): ComputerRawState {
  return {
    apps: [
      { bundle_id: null, name: COMPUTER_CURRENT_MM_APP, pid: COMPUTER_CURRENT_MM_PID, running: true },
      { bundle_id: null, name: "Installed.App.exe", pid: 0, running: false },
    ],
  }
}
