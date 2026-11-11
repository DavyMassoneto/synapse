import { type CommandRegistry } from "./command"
import { type LifecycleHost } from "./lifecycle"
import { type ToolRegistry } from "./tool-registration"

export type AdvisorHost = ToolRegistry & CommandRegistry & LifecycleHost
