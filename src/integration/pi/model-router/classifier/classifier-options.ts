import { type PiClassifyOptions } from "./types"

export function piRouterClassifierOptions(signal?: AbortSignal): PiClassifyOptions {
  const options: PiClassifyOptions = {}
  if (signal) {
    options.signal = signal
  }
  return options
}
