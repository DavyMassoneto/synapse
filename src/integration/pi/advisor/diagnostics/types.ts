export interface StatusFormatterOptions {}

export interface StatusFormatter {
  format(model: string): string
}

export type StatusFormatterFactory = (options: StatusFormatterOptions) => StatusFormatter
