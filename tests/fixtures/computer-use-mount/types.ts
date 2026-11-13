import { type Static } from "typebox"
import { type PiProcessRequestLog } from "../request-log"
import {
  type COMPUTER_MOUNT_EVENT_SCHEMA,
  type COMPUTER_MOUNT_INPUT_SCHEMA,
  type COMPUTER_MOUNT_REQUEST_SCHEMA,
} from "./schemas"

export type ComputerMountRequest = Static<typeof COMPUTER_MOUNT_REQUEST_SCHEMA>

export type ComputerMountEvent = Static<typeof COMPUTER_MOUNT_EVENT_SCHEMA>

export interface ComputerMountHandshakeResult {
  protocolVersion: string
  serverInfo: ComputerMountServerInfo
}

export interface ComputerMountServerInfo {
  name: string
  version: string
}

export interface ComputerMountToolsResult {
  tools: ComputerMountFakeTool[]
}

export interface ComputerMountCallResult {
  content: never[]
  structuredContent: ComputerMountFakeState
  isError: boolean
}

export type ComputerMountResponseResult =
  | ComputerMountHandshakeResult
  | ComputerMountToolsResult
  | ComputerMountCallResult

export interface ComputerMountFakeTool {
  name: string
  inputSchema: ComputerMountFakeInputSchema
}

export type ComputerMountFakeInputSchema = typeof COMPUTER_MOUNT_INPUT_SCHEMA

export interface ComputerMountFakeElement {
  element_index: number
  role: string
  label: string
  element_token: string
}

export interface ComputerMountFakeWindow {
  app_name: string
  pid: number
  window_id: number
  is_on_screen: boolean
  title: string
  z_index: number
}

export interface ComputerMountFakeApp {
  name: string
  pid: number
  running: boolean
}

export interface ComputerMountFakeState {
  message: string
  verified: boolean
  windows: ComputerMountFakeWindow[]
  apps: ComputerMountFakeApp[]
  elements: ComputerMountFakeElement[]
  screenshot_png_b64: string
  screenshot_mime_type: string
  tree_markdown: string
}

export type ComputerMountRequestMessage = PiProcessRequestLog["messages"][number]

export interface ComputerMountRequestBlock {
  type: string
  text?: string
}
