export const COMPUTER_DRIVER_RELEASE_CHECKSUM_ASSET_SHA256SUMS = "SHA256SUMS"

export const COMPUTER_DRIVER_RELEASE_CHECKSUM_ASSET_CHECKSUMS_TEXT = "checksums.txt"

export const COMPUTER_DRIVER_RELEASE_CHECKSUM_ASSET_RELEASE_MANIFEST = "release-manifest.json"

export const COMPUTER_DRIVER_RELEASE_MAX_CHECKSUM_BYTES = 1048576

export const COMPUTER_DRIVER_RELEASE_CHECKSUM_LINE_PATTERN = /^([0-9a-f]{64}) [ *](.+)$/

export const COMPUTER_DRIVER_RELEASE_ASSET_DIGEST_PATTERN = /^sha256:([0-9a-f]{64})$/

export const COMPUTER_DRIVER_RELEASE_CODE_BLOCK_PATTERN = /```[^\n]*\n([\s\S]*?)```/

export const COMPUTER_DRIVER_RELEASE_LINE_BREAK_PATTERN = /\r?\n/

export const COMPUTER_DRIVER_RELEASE_PATH_SEPARATOR = "/"

export const COMPUTER_DRIVER_RELEASE_FOREIGN_PATH_SEPARATOR = "\\"

export const COMPUTER_DRIVER_RELEASE_CURRENT_DIRECTORY = "."

export const COMPUTER_DRIVER_RELEASE_PARENT_DIRECTORY = ".."

export const COMPUTER_DRIVER_RELEASE_CHECKSUM_FOUND = "checksum-found"

export const COMPUTER_DRIVER_RELEASE_CHECKSUM_PARSED = "checksum-parsed"

export const COMPUTER_DRIVER_RELEASE_CHECKSUM_MISSING =
  "A release do cua-driver não publica checksum verificável para o pacote."

export const COMPUTER_DRIVER_RELEASE_CHECKSUM_MALFORMED =
  "O checksum publicado da release do cua-driver está malformado."

export const COMPUTER_DRIVER_RELEASE_CHECKSUM_DIVERGENT =
  "O checksum do pacote diverge entre as fontes publicadas pela release do cua-driver."
