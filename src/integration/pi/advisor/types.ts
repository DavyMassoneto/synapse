import { type CommandRegistry } from "./command"
import { type LifecycleHost } from "./lifecycle"
import { type ToolRegistry } from "./tool"

export type AdvisorHost = ToolRegistry & CommandRegistry & LifecycleHost
