import {
  COMPUTER_UNITY_BRIDGE_DISPATCHED_STATUS,
  type ComputerUnityBridgeActionRecord,
  type ComputerUnityBridgeTreeRecord,
} from "#synapse/modules/computer-use/adapters/unity-bridge"
import {
  COMPUTER_UNITY_BRIDGE_TEST_FOFOCAS_CLIENT_X,
  COMPUTER_UNITY_BRIDGE_TEST_FOFOCAS_CLIENT_Y,
  COMPUTER_UNITY_BRIDGE_TEST_LABEL,
} from "./unity-bridge-constants"

export const COMPUTER_UNITY_BRIDGE_TEST_TREE_GENERATION = 17

export const COMPUTER_UNITY_BRIDGE_TEST_TREE_FOFOCAS_ID = "3f2a1b7c-0a1d"

export const COMPUTER_UNITY_BRIDGE_TEST_TREE_INBOX_ID = "aa11bb22-0c0d"

export const COMPUTER_UNITY_BRIDGE_TEST_TREE_TEXT_ID = "9c01fe22-77b0"

export const COMPUTER_UNITY_BRIDGE_TEST_TREE_INBOX_LABEL = "Caixa de entrada"

export const COMPUTER_UNITY_BRIDGE_TEST_TREE_TEXT = "Sem mensagens"

export function computerUnityBridgeTestEmptyTree(): ComputerUnityBridgeTreeRecord {
  return { status: "ok", items: [] }
}

export function computerUnityBridgeTestTree(): ComputerUnityBridgeTreeRecord {
  return {
    status: "ok",
    protocol: 2,
    generation: COMPUTER_UNITY_BRIDGE_TEST_TREE_GENERATION,
    count: 3,
    returned: 3,
    screen: { width: 1794, height: 971 },
    event_system: true,
    selected_id: null,
    items: [
      {
        id: COMPUTER_UNITY_BRIDGE_TEST_TREE_FOFOCAS_ID,
        kind: "selectable",
        path: "MailScreen/ToggleList/UIMailToggleEntry(Clone)/Toggle",
        type: "Toggle",
        label: COMPUTER_UNITY_BRIDGE_TEST_LABEL,
        interactable: true,
        is_on: false,
        selected: false,
        client_x: 72,
        client_y: 346,
        client_w: 134,
        client_h: 26,
        cx: COMPUTER_UNITY_BRIDGE_TEST_FOFOCAS_CLIENT_X,
        cy: COMPUTER_UNITY_BRIDGE_TEST_FOFOCAS_CLIENT_Y,
        depth: 7,
      },
      {
        id: COMPUTER_UNITY_BRIDGE_TEST_TREE_INBOX_ID,
        kind: "selectable",
        path: "MailScreen/ToggleList/Inbox/Button",
        type: "Button",
        label: COMPUTER_UNITY_BRIDGE_TEST_TREE_INBOX_LABEL,
        interactable: true,
        client_x: 113,
        client_y: 194,
        client_w: 120,
        client_h: 22,
        depth: 6,
      },
      {
        id: "ccccdddd-1234",
        kind: "selectable",
        path: "MailScreen/Offscreen/Button",
        type: "Button",
        label: "Fora da tela",
        interactable: true,
        client_x: 113,
        client_y: 1200,
        client_w: 120,
        client_h: 22,
        depth: 4,
      },
    ],
    texts: [
      {
        id: COMPUTER_UNITY_BRIDGE_TEST_TREE_TEXT_ID,
        kind: "text",
        path: "MailScreen/ToggleList/UIMailToggleEntry(Clone)/Label",
        text: COMPUTER_UNITY_BRIDGE_TEST_LABEL,
        selectable_id: COMPUTER_UNITY_BRIDGE_TEST_TREE_FOFOCAS_ID,
        client_x: 76,
        client_y: 349,
        client_w: 80,
        client_h: 20,
      },
      {
        id: "9c01fe22-77b1",
        kind: "text",
        path: "MailScreen/Inbox/Empty",
        text: COMPUTER_UNITY_BRIDGE_TEST_TREE_TEXT,
        selectable_id: null,
        client_x: 72,
        client_y: 380,
        client_w: 100,
        client_h: 20,
      },
    ],
  }
}

export function computerUnityBridgeTestDispatchedScroll(): ComputerUnityBridgeActionRecord {
  return {
    status: COMPUTER_UNITY_BRIDGE_DISPATCHED_STATUS,
    route: "raycast",
    effect: "unverifiable",
    point: {
      client_x: COMPUTER_UNITY_BRIDGE_TEST_FOFOCAS_CLIENT_X,
      client_y: COMPUTER_UNITY_BRIDGE_TEST_FOFOCAS_CLIENT_Y,
    },
    scroll_delta: { x: 0, y: -3 },
    scroll_rect: {
      path: "MailScreen/Scroll View",
      normalized_before: { x: 0.5, y: 1 },
      normalized_after: { x: 0.5, y: 0.62 },
    },
    fallback: "manual-normalized",
    manual_applied: true,
    normalized_changed: true,
    resolved_by: "id",
    generation: COMPUTER_UNITY_BRIDGE_TEST_TREE_GENERATION + 1,
    action_desktop: { cursor_moved: false, foreground_changed: false },
    hint: "scroll nao prova efeito visual.",
  }
}

export function computerUnityBridgeTestDispatchedDrag(): ComputerUnityBridgeActionRecord {
  return {
    status: COMPUTER_UNITY_BRIDGE_DISPATCHED_STATUS,
    route: "raycast",
    effect: "unverifiable",
    from: { client_x: 100, client_y: 300 },
    to: { client_x: 100, client_y: 180 },
    steps: 8,
    generation: COMPUTER_UNITY_BRIDGE_TEST_TREE_GENERATION + 1,
  }
}

export function computerUnityBridgeTestDispatchedText(): ComputerUnityBridgeActionRecord {
  return {
    status: COMPUTER_UNITY_BRIDGE_DISPATCHED_STATUS,
    effect: "unverifiable",
    input: { path: "MailScreen/InputField", type: "InputField" },
    text_length: 3,
    value_before: "",
    value_after: "abc",
    truncated: false,
    submitted: false,
    generation: COMPUTER_UNITY_BRIDGE_TEST_TREE_GENERATION + 1,
  }
}

export function computerUnityBridgeTestDispatchedKey(): ComputerUnityBridgeActionRecord {
  return {
    status: COMPUTER_UNITY_BRIDGE_DISPATCHED_STATUS,
    route: "submit",
    effect: "unverifiable",
    key: "Return",
    selected_before: { path: "MailScreen/Inbox/Button", type: "Button" },
    selected_after: { path: "MailScreen/Inbox/Button", type: "Button" },
    moved: false,
    generation: COMPUTER_UNITY_BRIDGE_TEST_TREE_GENERATION + 1,
  }
}

export function computerUnityBridgeTestTreeV1(): ComputerUnityBridgeTreeRecord {
  return {
    status: "ok",
    items: [
      {
        path: "MailScreen/ToggleList/UIMailToggleEntry(Clone)/Toggle",
        type: "Toggle",
        label: COMPUTER_UNITY_BRIDGE_TEST_LABEL,
        interactable: true,
        is_on: false,
        client_x: 72,
        client_y: 346,
        client_w: 134,
        client_h: 26,
        depth: 7,
      },
    ],
  }
}
