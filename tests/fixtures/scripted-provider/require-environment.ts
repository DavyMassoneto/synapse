import { PI_PROCESS_ENV_FAILURE } from "./constants"

export function requireEnvironment(name: string): string {
  const value = process.env[name]
  if (!value) {
    throw new Error(PI_PROCESS_ENV_FAILURE)
  }
  return value
}
