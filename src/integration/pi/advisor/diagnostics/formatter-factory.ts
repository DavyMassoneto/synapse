import { type StatusFormatter, type StatusFormatterOptions } from "./types"

export function createStatusFormatter(
  options: StatusFormatterOptions,
  locale: string,
  verbose: boolean,
  plugins: string[],
): StatusFormatter {
  return { format: (model: string) => `advisor: ${model}` }
}
