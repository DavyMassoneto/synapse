export const COMPUTER_DRIVER_CURRENT_FILE = "current"

export const COMPUTER_DRIVER_VERSION_PATTERN = /^\d+\.\d+\.\d+$/

export const COMPUTER_DRIVER_VERSION_COLLATOR = new Intl.Collator("en", { numeric: true })

export const COMPUTER_DRIVER_FOREIGN_SEPARATOR_PATTERN = /\\/g

export const COMPUTER_DRIVER_PORTABLE_SEPARATOR = "/"

export const COMPUTER_DRIVER_ENCODING = "utf8"

export const COMPUTER_DRIVER_POINTER_END = "\n"

export const COMPUTER_DRIVER_POINTER_MODE = 0o600

export const COMPUTER_DRIVER_VERSION_FOUND = "version-found"

export const COMPUTER_DRIVER_VERSION_ABSENT = "version-absent"

export const COMPUTER_DRIVER_FOUND = "driver-found"

export const COMPUTER_DRIVER_ABSENT = "driver-absent"

export const COMPUTER_DRIVER_NOT_INSTALLED = "O cua-driver não está instalado nesta máquina."

export const COMPUTER_DRIVER_OVERRIDE_MISSING = "O caminho informado para o cua-driver não existe."

export const COMPUTER_DRIVER_RECEIPT_FILE = "installation.json"

export const COMPUTER_DRIVER_RECEIPT_FILE_MODE = 0o600

export const COMPUTER_DRIVER_RECEIPT_FOUND = "receipt-found"

export const COMPUTER_DRIVER_RECEIPT_ABSENT = "receipt-absent"

export const COMPUTER_DRIVER_RECEIPT_INVALID = "receipt-invalid"

export const COMPUTER_DRIVER_RECEIPT_VERSION_PATTERN = "^\\d+\\.\\d+\\.\\d+$"

export const COMPUTER_DRIVER_RECEIPT_HASH_PATTERN = "^[a-f0-9]{64}$"

export const COMPUTER_DRIVER_RECEIPT_HASH_ALGORITHM = "sha256"

export const COMPUTER_DRIVER_RECEIPT_HASH_ENCODING = "hex"

export const COMPUTER_DRIVER_RECEIPT_INVALID_MESSAGE = "O recibo da instalação gerenciada do cua-driver é inválido."

export const COMPUTER_DRIVER_INSTALLATION_REUSABLE = "installation-reusable"

export const COMPUTER_DRIVER_INSTALLATION_ABSENT = "installation-absent"

export const COMPUTER_DRIVER_INSTALLATION_CONFLICT = "installation-conflict"

export const COMPUTER_DRIVER_INSTALLATION_CORRUPT = "installation-corrupt"

export const COMPUTER_DRIVER_INSTALLATION_DESTINATION_CONFLICT =
  "O destino do cua-driver existe sem um executável válido."

export const COMPUTER_DRIVER_INSTALLATION_SELECTION_CONFLICT =
  "A instalação gerenciada do cua-driver não corresponde à release selecionada; a versão existente foi preservada."

export const COMPUTER_DRIVER_INSTALLATION_CORRUPT_MESSAGE =
  "A instalação gerenciada do cua-driver está incompleta ou foi alterada; a versão existente foi preservada."
