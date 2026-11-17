import { WATCHDOG_SHELL_QUOTE, WATCHDOG_SHELL_QUOTE_ESCAPE } from "./constants"

export function quoteWatchdogShellArgument(value: string): string {
  return (
    WATCHDOG_SHELL_QUOTE + value.replaceAll(WATCHDOG_SHELL_QUOTE, WATCHDOG_SHELL_QUOTE_ESCAPE) + WATCHDOG_SHELL_QUOTE
  )
}
