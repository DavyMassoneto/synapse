import { DefaultPackageManager, DefaultResourceLoader, type ResourceLoader } from "@earendil-works/pi-coding-agent"
import { TEAM_PI_MEMBER_EXTENSION_FAILURE } from "../extension-lifecycle"
import { readMemberExtensions } from "../member-extensions"
import { canonicalTeamExtensionPath } from "./canonical-path"
import { type TeamMemberResourceRequest } from "./types"

export class TeamMemberResourceLoader implements ResourceLoader {
  private readonly loader: DefaultResourceLoader

  private readonly paths: string[] = []
  private readonly request: TeamMemberResourceRequest

  constructor(request: TeamMemberResourceRequest) {
    this.request = request
    this.loader = new DefaultResourceLoader({
      cwd: request.cwd,
      agentDir: request.agentDirectory,
      settingsManager: request.settings,
      noExtensions: true,
      additionalExtensionPaths: this.paths,
      appendSystemPrompt: [request.instructions],
    })
    this.getExtensions = this.loader.getExtensions.bind(this.loader)
    this.getSkills = this.loader.getSkills.bind(this.loader)
    this.getPrompts = this.loader.getPrompts.bind(this.loader)
    this.getThemes = this.loader.getThemes.bind(this.loader)
    this.getAgentsFiles = this.loader.getAgentsFiles.bind(this.loader)
    this.getSystemPrompt = this.loader.getSystemPrompt.bind(this.loader)
    this.getSystemPromptSource = this.loader.getSystemPromptSource.bind(this.loader)
    this.getAppendSystemPrompt = this.loader.getAppendSystemPrompt.bind(this.loader)
    this.getAppendSystemPromptSources = this.loader.getAppendSystemPromptSources.bind(this.loader)
    this.extendResources = this.loader.extendResources.bind(this.loader)
  }

  getExtensions: ResourceLoader["getExtensions"]

  getSkills: ResourceLoader["getSkills"]

  getPrompts: ResourceLoader["getPrompts"]

  getThemes: ResourceLoader["getThemes"]

  getAgentsFiles: ResourceLoader["getAgentsFiles"]

  getSystemPrompt: ResourceLoader["getSystemPrompt"]

  getSystemPromptSource: ResourceLoader["getSystemPromptSource"]

  getAppendSystemPrompt: ResourceLoader["getAppendSystemPrompt"]

  getAppendSystemPromptSources: ResourceLoader["getAppendSystemPromptSources"]

  extendResources: ResourceLoader["extendResources"]

  async reload(): Promise<void> {
    const paths = await this.resolveExtensions()
    this.loader.getExtensions().runtime.invalidate()
    this.paths.splice(0, this.paths.length, ...paths)
    await this.loader.reload()
    const errors = this.loader.getExtensions().errors
    if (errors.length > 0) {
      this.loader.getExtensions().runtime.invalidate()
      throw new Error(TEAM_PI_MEMBER_EXTENSION_FAILURE + JSON.stringify(errors))
    }
  }

  private async resolveExtensions(): Promise<string[]> {
    const request = this.request
    const excluded = new Set<string>()
    for (const path of readMemberExtensions(request.agentDirectory)) {
      excluded.add(canonicalTeamExtensionPath(path))
    }
    await request.settings.reload()
    const manager = new DefaultPackageManager({
      cwd: request.cwd,
      agentDir: request.agentDirectory,
      settingsManager: request.settings,
    })
    const resources = await manager.resolve()
    if (resources.installFailures?.length) {
      throw new Error(TEAM_PI_MEMBER_EXTENSION_FAILURE + JSON.stringify(resources.installFailures))
    }
    const paths: string[] = []
    const selected = new Set<string>()
    for (const resource of resources.extensions) {
      if (resource.enabled) {
        const path = canonicalTeamExtensionPath(resource.path)
        if (!excluded.has(path) && !selected.has(path)) {
          paths.push(resource.path)
          selected.add(path)
        }
      }
    }
    return paths
  }
}
