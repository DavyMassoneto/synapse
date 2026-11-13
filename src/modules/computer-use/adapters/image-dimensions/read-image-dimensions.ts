import {
  COMPUTER_DIMENSIONS_ABSENT,
  COMPUTER_DIMENSIONS_FOUND,
  COMPUTER_JPEG_END,
  COMPUTER_JPEG_FRAME_MIN_BYTES,
  COMPUTER_JPEG_HEIGHT_OFFSET,
  COMPUTER_JPEG_MARKER_PREFIX,
  COMPUTER_JPEG_SCAN,
  COMPUTER_JPEG_START,
  COMPUTER_JPEG_WIDTH_OFFSET,
  COMPUTER_PNG_CHUNK_TYPE_OFFSET,
  COMPUTER_PNG_HEADER_BYTES,
  COMPUTER_PNG_HEIGHT_OFFSET,
  COMPUTER_PNG_IHDR,
  COMPUTER_PNG_SIGNATURE,
  COMPUTER_PNG_WIDTH_OFFSET,
} from "./constants"
import { isComputerJpegFrameMarker, isComputerJpegStandaloneMarker } from "./predicates"
import { type ComputerImageDimensions } from "./types"

function computerReadJpegDimensions(bytes: Buffer): ComputerImageDimensions {
  let offset = 2
  while (offset + 1 < bytes.length) {
    if (bytes[offset] !== COMPUTER_JPEG_MARKER_PREFIX) {
      offset += 1
      continue
    }
    const marker = bytes.readUInt8(offset + 1)
    offset += 2
    if (marker === COMPUTER_JPEG_MARKER_PREFIX) {
      offset -= 1
      continue
    }
    if (marker === COMPUTER_JPEG_END || marker === COMPUTER_JPEG_SCAN) {
      break
    }
    if (isComputerJpegStandaloneMarker(marker)) {
      continue
    }
    const length = computerReadJpegSegmentLength(bytes, offset)
    if (!length) {
      break
    }
    if (isComputerJpegFrameMarker(marker)) {
      return computerReadJpegFrame(bytes, offset, length)
    }
    offset += length
  }
  return { kind: COMPUTER_DIMENSIONS_ABSENT }
}

function computerReadJpegSegmentLength(bytes: Buffer, offset: number): number {
  if (offset + 2 <= bytes.length) {
    const length = bytes.readUInt16BE(offset)
    if (length >= 2 && offset + length <= bytes.length) {
      return length
    }
  }
  return 0
}

function computerReadJpegFrame(bytes: Buffer, offset: number, length: number): ComputerImageDimensions {
  if (length >= COMPUTER_JPEG_FRAME_MIN_BYTES) {
    return computerValidateImageDimensions(
      bytes.readUInt16BE(offset + COMPUTER_JPEG_WIDTH_OFFSET),
      bytes.readUInt16BE(offset + COMPUTER_JPEG_HEIGHT_OFFSET),
    )
  }
  return { kind: COMPUTER_DIMENSIONS_ABSENT }
}

function computerValidateImageDimensions(width: number, height: number): ComputerImageDimensions {
  if (width > 0 && height > 0) {
    return { kind: COMPUTER_DIMENSIONS_FOUND, width, height }
  }
  return { kind: COMPUTER_DIMENSIONS_ABSENT }
}

export function computerReadImageDimensions(input: Uint8Array): ComputerImageDimensions {
  const bytes = Buffer.from(input.buffer, input.byteOffset, input.byteLength)
  if (
    bytes.length >= COMPUTER_PNG_HEADER_BYTES &&
    COMPUTER_PNG_SIGNATURE.every((byte, index) => bytes[index] === byte) &&
    COMPUTER_PNG_IHDR.every((byte, index) => bytes[index + COMPUTER_PNG_CHUNK_TYPE_OFFSET] === byte)
  ) {
    return computerValidateImageDimensions(
      bytes.readUInt32BE(COMPUTER_PNG_WIDTH_OFFSET),
      bytes.readUInt32BE(COMPUTER_PNG_HEIGHT_OFFSET),
    )
  }
  if (bytes[0] === COMPUTER_JPEG_MARKER_PREFIX && bytes[1] === COMPUTER_JPEG_START) {
    return computerReadJpegDimensions(bytes)
  }
  return { kind: COMPUTER_DIMENSIONS_ABSENT }
}
