import {
  COMPUTER_BOUNDS_KNOWN,
  COMPUTER_IMAGE_PRESENT,
  COMPUTER_MODE_SOM,
  COMPUTER_PNG_MIME,
  COMPUTER_TITLE_PRESENT,
  type ComputerCapture,
  type ComputerWindow,
} from "../public"

export function computerTestWindow(app: string, pid: number, zIndex: number): ComputerWindow {
  return {
    app,
    pid,
    windowId: pid,
    zIndex,
    onScreen: true,
    title: app,
    bounds: { kind: COMPUTER_BOUNDS_KNOWN, rectangle: { x: 0, y: 0, width: 200, height: 200 } },
  }
}

export function computerTestCapture(): ComputerCapture {
  return {
    mode: COMPUTER_MODE_SOM,
    app: "Editor",
    windowTitle: { kind: COMPUTER_TITLE_PRESENT, title: "Documento" },
    elements: [
      {
        index: 1,
        role: "AXButton",
        label: "Salvar",
        app: "Editor",
        bounds: { kind: COMPUTER_BOUNDS_KNOWN, rectangle: { x: 0, y: 0, width: 200, height: 200 } },
      },
    ],
    image: { kind: COMPUTER_IMAGE_PRESENT, data: "pixels", mime: COMPUTER_PNG_MIME, width: 100, height: 100 },
    note: "",
    axMaxElements: 200,
  }
}

export function computerTestPng(): Uint8Array {
  return Uint8Array.from([137, 80, 78, 71, 13, 10, 26, 10, 0, 0, 0, 13, 73, 72, 68, 82, 0, 0, 2, 0, 0, 0, 1, 0])
}

export function computerTestJpeg(): Uint8Array {
  return Uint8Array.from([255, 216, 255, 224, 0, 4, 0, 0, 255, 192, 0, 11, 8, 1, 0, 2, 0, 1, 1, 17, 0])
}
