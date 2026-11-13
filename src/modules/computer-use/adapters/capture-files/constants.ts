import { type ComputerCaptureFileImageExtensions } from "./types"

export const COMPUTER_CAPTURE_FILE_DIRECTORY_MODE = 0o700

export const COMPUTER_CAPTURE_FILE_MODE = 0o600

export const COMPUTER_CAPTURE_FILE_ROTATION_LIMIT = 20

export const COMPUTER_CAPTURE_FILE_IMAGE_PREFIX = "capture_"

export const COMPUTER_CAPTURE_FILE_ELEMENTS_PREFIX = "elements_"

export const COMPUTER_CAPTURE_FILE_ELEMENTS_EXTENSION = ".json"

export const COMPUTER_CAPTURE_FILE_IMAGE_ENCODING = "base64"

export const COMPUTER_CAPTURE_FILE_INDENT = 1

export const COMPUTER_CAPTURE_FILE_END = "\n"

export const COMPUTER_CAPTURE_FILE_STORE_FAILED = "Não foi possível gravar a captura."

export const COMPUTER_CAPTURE_FILE_IMAGE_EXTENSIONS: ComputerCaptureFileImageExtensions = {
  "image/png": ".png",
  "image/jpeg": ".jpg",
}
