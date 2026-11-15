import { createBashToolDefinition, defineTool, type LoadExtensionsResult } from "@earendil-works/pi-coding-agent"
import { type SupervisedShellService } from "#synapse/modules/agent-team/public/supervised-shell"
import { SUPERVISED_BASH_TOOL_NAME } from "./constants"
import { SupervisedBashOperations } from "./operations"
import { type SupervisedBashMountRequest, type SupervisedBashToolList, type SupervisedBashToolOptions } from "./types"

export function updateSupervisedBashTool(request: SupervisedBashMountRequest, loaded: LoadExtensionsResult): void {
  const tools = request.tools
  const shell = request.shell
  if (tools && shell) {
    const names: string[] = []
    for (const extension of loaded.extensions) {
      names.push(...extension.tools.keys())
    }
    const replacements = new Set(names)
    const registered = new Map<string, SupervisedBashToolList[number]>()
    for (const tool of tools) {
      registered.set(tool.name, tool)
    }
    registered.delete(SUPERVISED_BASH_TOOL_NAME)
    tools.splice(0, tools.length, ...registered.values())
    const overridden = replacements.has(SUPERVISED_BASH_TOOL_NAME)
    if (!overridden) {
      appendSupervisedBash(request, tools, shell)
    }
  }
}

function appendSupervisedBash(
  request: SupervisedBashMountRequest,
  tools: SupervisedBashToolList,
  shell: SupervisedShellService,
): void {
  const options: SupervisedBashToolOptions = {
    operations: new SupervisedBashOperations(shell, request.settings.getShellPath()),
  }
  const prefix = request.settings.getShellCommandPrefix()
  if (prefix) {
    options.commandPrefix = prefix
  }
  tools.push(defineTool({ ...createBashToolDefinition(request.cwd, options), defaultActive: false }))
}
