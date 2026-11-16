import { execFileSync } from "node:child_process"
import { mkdtempSync, rmSync } from "node:fs"
import { tmpdir } from "node:os"
import { join } from "node:path"
import {
  SHELL_COMPILED_NATIVE_CC,
  SHELL_COMPILED_NATIVE_INCLUDE,
  SHELL_COMPILED_NATIVE_OUTPUT,
  SHELL_COMPILED_NATIVE_POSIX,
  SHELL_COMPILED_NATIVE_SOURCE_DIRECTORY,
} from "./native-fixture-constants"
import { type CompiledNativeSpec } from "./native-test-types"

export function runCompiledNative(spec: CompiledNativeSpec): Buffer {
  const directory = mkdtempSync(join(tmpdir(), spec.directoryPrefix))
  try {
    const executable = join(directory, spec.executable)
    const source = join(__dirname, SHELL_COMPILED_NATIVE_SOURCE_DIRECTORY)
    const inputs = [join(__dirname, spec.fixture)]
    for (const name of spec.sources) {
      inputs.push(join(source, name))
    }
    execFileSync(SHELL_COMPILED_NATIVE_CC, [
      SHELL_COMPILED_NATIVE_POSIX,
      SHELL_COMPILED_NATIVE_INCLUDE,
      source,
      ...inputs,
      SHELL_COMPILED_NATIVE_OUTPUT,
      executable,
    ])
    return execFileSync(executable)
  } finally {
    rmSync(directory, { recursive: true, force: true })
  }
}
