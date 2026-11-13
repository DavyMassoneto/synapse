import { type ComputerShellNames } from "./types"

export const COMPUTER_SCREEN_NAMES = ["screen", "fullscreen", "full screen", "all"]

export const COMPUTER_DESKTOP_NAME = "desktop"

export const COMPUTER_DRIVER_WINDOW_NAME = "cuadriver"

export const COMPUTER_WINDOW_NAME_SEPARATORS = /[\s_-]+/g

export const COMPUTER_MIN_WINDOW_SIDE = 100

export const COMPUTER_SHELL_NAMES: ComputerShellNames = {
  darwin: ["finder", "desktop", "dock"],
  linux: ["desktop", "plasmashell", "gnome-shell", "xfdesktop", "caja", "nemo"],
  win32: ["progman", "workerw", "program manager", "shell_traywnd", "taskbar", "desktop"],
}

export const COMPUTER_SHELL_BACKDROPS: ComputerShellNames = {
  darwin: ["finder", "desktop"],
  linux: ["desktop", "xfdesktop", "caja", "nemo"],
  win32: ["progman", "workerw", "program manager", "desktop"],
}

export const COMPUTER_NO_ELIGIBLE_WINDOW = "Nenhuma janela elegível foi encontrada."

export const COMPUTER_INVALID_EXACT_TARGET = "O alvo exato exige pid e windowId inteiros positivos."

export const COMPUTER_INPUT_TARGET_MISMATCH =
  "A entrada iria para outro aplicativo; capture ou selecione o aplicativo solicitado primeiro."
