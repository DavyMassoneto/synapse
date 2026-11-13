import {
  type ComputerApplication,
  type ComputerPlatform,
  type ComputerWindow,
} from "#synapse/modules/computer-use/public/contracts"
import {
  COMPUTER_DESKTOP_NAME,
  COMPUTER_INVALID_EXACT_TARGET,
  COMPUTER_NO_ELIGIBLE_WINDOW,
  COMPUTER_SCREEN_NAMES,
  COMPUTER_SHELL_BACKDROPS,
  COMPUTER_SHELL_NAMES,
} from "./constants"
import { computerCopyWindow } from "./copy-window"
import {
  COMPUTER_EXACT_TARGET_SELECTED,
  COMPUTER_TARGET_APP,
  COMPUTER_TARGET_EXACT,
  COMPUTER_TARGET_REJECTED,
  COMPUTER_TARGET_SCREEN,
  COMPUTER_TARGET_SELECTED,
} from "./outcomes"
import { isComputerNonDriverWindow, isComputerShellWindow, isComputerSubstantialWindow } from "./predicates"
import { type ComputerExactTargetRequest, type ComputerTargetRequest, type ComputerTargetSelection } from "./types"

function computerMatchAppWindows(
  windows: ComputerWindow[],
  applications: ComputerApplication[],
  wanted: string,
): ComputerWindow[] {
  const exact = windows.filter((window) => window.app.trim().toLowerCase() === wanted)
  if (exact.length) {
    return exact
  }
  const exactPids = new Set<number>()
  const partialPids = new Set<number>()
  for (const app of applications) {
    if (app.running) {
      const aliases = [app.name, ...app.aliases].map((alias) => alias.trim().toLowerCase())
      if (aliases.includes(wanted)) {
        exactPids.add(app.pid)
      } else if (aliases.some((alias) => alias.includes(wanted))) {
        partialPids.add(app.pid)
      }
    }
  }
  const exactAliases = windows.filter((window) => exactPids.has(window.pid))
  if (exactAliases.length) {
    return exactAliases
  }
  const partialNames = windows.filter((window) => window.app.toLowerCase().includes(wanted))
  if (partialNames.length) {
    return partialNames
  }
  const partialAliases = windows.filter((window) => partialPids.has(window.pid))
  if (partialAliases.length) {
    return partialAliases
  }
  return windows.filter((window) => !window.app.trim() && window.title.toLowerCase().includes(wanted))
}

function computerPreferImplicitWindows(windows: ComputerWindow[], platform: ComputerPlatform): ComputerWindow[] {
  const eligible = windows.filter(isComputerNonDriverWindow)
  const nonShell = eligible.filter((window) => !isComputerShellWindow(window, COMPUTER_SHELL_NAMES[platform]))
  if (!nonShell.length) {
    return eligible
  }
  const substantial = nonShell.filter(isComputerSubstantialWindow)
  if (!substantial.length) {
    return nonShell
  }
  const titled = substantial.filter((window) => Boolean(window.title.trim()))
  return titled.length ? titled : substantial
}

function computerDesktopWindows(windows: ComputerWindow[], platform: ComputerPlatform): ComputerWindow[] {
  const shells = windows.filter((window) => isComputerShellWindow(window, COMPUTER_SHELL_NAMES[platform]))
  const backdrops = shells.filter((window) => isComputerShellWindow(window, COMPUTER_SHELL_BACKDROPS[platform]))
  return backdrops.length ? backdrops : shells
}

function computerScopedWindows(
  windows: ComputerWindow[],
  applications: ComputerApplication[],
  request: ComputerTargetRequest,
  platform: ComputerPlatform,
): ComputerWindow[] {
  if (request.kind !== COMPUTER_TARGET_APP) {
    return windows
  }
  const wanted = request.app.trim().toLowerCase()
  if (!wanted) {
    return []
  }
  if (wanted === COMPUTER_DESKTOP_NAME) {
    return computerDesktopWindows(windows, platform)
  }
  return computerMatchAppWindows(windows, applications, wanted)
}

export function computerSelectWindow(
  windows: ComputerWindow[],
  applications: ComputerApplication[],
  request: ComputerTargetRequest,
  platform: ComputerPlatform,
): ComputerTargetSelection {
  if (request.kind === COMPUTER_TARGET_EXACT) {
    return computerSelectExactTarget(request)
  }
  if (request.kind === COMPUTER_TARGET_APP && COMPUTER_SCREEN_NAMES.includes(request.app.trim().toLowerCase())) {
    return { kind: COMPUTER_TARGET_SCREEN }
  }
  const onScreen = windows.filter((window) => window.onScreen).sort(computerCompareWindowOrder)
  const scoped = computerScopedWindows(onScreen, applications, request, platform)
  const [selected] = computerPreferImplicitWindows(scoped, platform)
  if (!selected) {
    return { kind: COMPUTER_TARGET_REJECTED, message: COMPUTER_NO_ELIGIBLE_WINDOW }
  }
  return { kind: COMPUTER_TARGET_SELECTED, window: computerCopyWindow(selected) }
}

function computerCompareWindowOrder(left: ComputerWindow, right: ComputerWindow): number {
  return right.zIndex - left.zIndex
}

function computerSelectExactTarget(request: ComputerExactTargetRequest): ComputerTargetSelection {
  if (
    !Number.isSafeInteger(request.pid) ||
    request.pid <= 0 ||
    !Number.isSafeInteger(request.windowId) ||
    request.windowId <= 0
  ) {
    return { kind: COMPUTER_TARGET_REJECTED, message: COMPUTER_INVALID_EXACT_TARGET }
  }
  return { kind: COMPUTER_EXACT_TARGET_SELECTED, pid: request.pid, windowId: request.windowId }
}
