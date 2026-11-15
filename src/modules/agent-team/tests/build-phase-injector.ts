import { execFileSync } from "node:child_process"
import { join } from "node:path"
import {
  SHELL_PHASE_COMPILER_COMMAND,
  SHELL_PHASE_COMPILER_OUTPUT_FLAG,
  SHELL_PHASE_DARWIN_LIBRARY_FILE,
  SHELL_PHASE_DARWIN_LIBRARY_FLAG,
  SHELL_PHASE_INJECTOR_SOURCE,
  SHELL_PHASE_LINUX_BINARY,
  SHELL_PHASE_LINUX_COMPILE_FLAGS,
  SHELL_PHASE_LINUX_WRAP,
  SHELL_PHASE_NATIVE_DIRECTORY,
  SHELL_PHASE_NATIVE_SOURCES,
} from "./constants"
import { SHELL_TEST_DARWIN_PLATFORM } from "./native-scenario-constants"

export function buildPhaseInjector(directory: string): void {
  if (process.platform === SHELL_TEST_DARWIN_PLATFORM) {
    execFileSync(SHELL_PHASE_COMPILER_COMMAND, [
      SHELL_PHASE_DARWIN_LIBRARY_FLAG,
      join(__dirname, SHELL_PHASE_INJECTOR_SOURCE),
      SHELL_PHASE_COMPILER_OUTPUT_FLAG,
      join(directory, SHELL_PHASE_DARWIN_LIBRARY_FILE),
    ])
  } else {
    const source = join(__dirname, SHELL_PHASE_NATIVE_DIRECTORY)
    const argumentsList = [...SHELL_PHASE_LINUX_COMPILE_FLAGS, source]
    for (const input of SHELL_PHASE_NATIVE_SOURCES) {
      argumentsList.push(join(source, input))
    }
    argumentsList.push(
      join(__dirname, SHELL_PHASE_INJECTOR_SOURCE),
      SHELL_PHASE_LINUX_WRAP,
      SHELL_PHASE_COMPILER_OUTPUT_FLAG,
      join(directory, SHELL_PHASE_LINUX_BINARY),
    )
    execFileSync(SHELL_PHASE_COMPILER_COMMAND, argumentsList)
  }
}
