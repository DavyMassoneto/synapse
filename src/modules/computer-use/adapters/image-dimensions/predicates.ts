import {
  COMPUTER_JPEG_FRAME_MAX,
  COMPUTER_JPEG_FRAME_MIN,
  COMPUTER_JPEG_NON_FRAME_MARKERS,
  COMPUTER_JPEG_STANDALONE_MAX,
  COMPUTER_JPEG_STANDALONE_MIN,
} from "./constants"

export function isComputerJpegFrameMarker(marker: number): boolean {
  return (
    marker >= COMPUTER_JPEG_FRAME_MIN &&
    marker <= COMPUTER_JPEG_FRAME_MAX &&
    !COMPUTER_JPEG_NON_FRAME_MARKERS.includes(marker)
  )
}

export function isComputerJpegStandaloneMarker(marker: number): boolean {
  return marker >= COMPUTER_JPEG_STANDALONE_MIN && marker <= COMPUTER_JPEG_STANDALONE_MAX
}
