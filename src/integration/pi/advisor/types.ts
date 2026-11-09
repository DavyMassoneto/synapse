import { type CommandRegistry } from "./command"
import { type LifecycleHost } from "./lifecycle"
import { type ToolRegistry } from "./tool"

export interface AdvisorHost extends ToolRegistry, CommandRegistry, LifecycleHost {}
