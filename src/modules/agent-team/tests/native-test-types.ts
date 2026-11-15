import { type StdioOptions } from "node:child_process"

export type ShellTestStdioOptions = StdioOptions

export interface CompiledNativeSpec {
  directoryPrefix: string
  executable: string
  fixture: string
  sources: string[]
}
