import { createExtensionRuntime, type ResourceLoader } from "@earendil-works/pi-coding-agent"
import { EMPTY_RESOURCES, SYSTEM_PROMPT } from "./constants"

export class ReviewResources implements ResourceLoader {
  getExtensions(): ReturnType<ResourceLoader["getExtensions"]> {
    return { extensions: [], errors: [], runtime: createExtensionRuntime() }
  }
  getSkills(): ReturnType<ResourceLoader["getSkills"]> {
    return { skills: [], diagnostics: [] }
  }
  getPrompts(): ReturnType<ResourceLoader["getPrompts"]> {
    return { prompts: [], diagnostics: [] }
  }
  getThemes(): ReturnType<ResourceLoader["getThemes"]> {
    return { themes: [], diagnostics: [] }
  }
  getAgentsFiles(): ReturnType<ResourceLoader["getAgentsFiles"]> {
    return { agentsFiles: [] }
  }
  getSystemPrompt(): string {
    return SYSTEM_PROMPT
  }
  getSystemPromptSource(): ReturnType<ResourceLoader["getSystemPromptSource"]> {
    return this.getAppendSystemPromptSources().at(0)
  }
  getAppendSystemPrompt(): string[] {
    return EMPTY_RESOURCES
  }
  getAppendSystemPromptSources(): ReturnType<ResourceLoader["getAppendSystemPromptSources"]> {
    return []
  }
  extendResources(): void {}
  async reload(): Promise<void> {}
}
