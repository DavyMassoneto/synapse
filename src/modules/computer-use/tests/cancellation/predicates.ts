export function isClick(name: string): boolean {
  return name === "click"
}

export function isCapture(name: string): boolean {
  return name === "get_window_state"
}

export function isList(name: string): boolean {
  return name === "list_apps"
}
