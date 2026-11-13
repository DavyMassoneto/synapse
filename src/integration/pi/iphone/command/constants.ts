export const PI_IPHONE_COMMAND_SETTING = /\s+([A-Za-z][A-Za-z0-9]*)=("(?:[^"\\]|\\.)*"|[^\s"\\]+)(?=\s|$)/y

export const PI_IPHONE_COMMAND_QUOTE = '"'

export const PI_IPHONE_COMMAND_WORDS = /\s+/

export const PI_IPHONE_COMMAND_INVALID_CHANGE =
  'Use config chave=valor; para espaços, use chave="valor com espaços" com escapes JSON.'

export const PI_IPHONE_COMMAND_UPDATED = "Configuração atualizada."

export const PI_IPHONE_COMMAND_EMPTY = ""

export const PI_IPHONE_COMMAND_NAME = "iphone"

export const PI_IPHONE_COMMAND_DESCRIPTION =
  'iPhone: status | doctor | config chave=valor (espaços: chave="valor com espaços", escapes JSON) | log | start | stop | reset'

export const PI_IPHONE_COMMAND_STATUS = "status"

export const PI_IPHONE_COMMAND_DOCTOR = "doctor"

export const PI_IPHONE_COMMAND_START = "start"

export const PI_IPHONE_COMMAND_STOP = "stop"

export const PI_IPHONE_COMMAND_RESET = "reset"

export const PI_IPHONE_COMMAND_CLOSED = "Sessão encerrada."

export const PI_IPHONE_COMMAND_STARTED = "Servidor iniciado."

export const PI_IPHONE_COMMAND_LEVEL = "info"

export const PI_IPHONE_COMMAND_USAGE = "Use /iphone status | doctor | config | log | start | stop | reset."

export const PI_IPHONE_COMMAND_CONFIG = "config"

export const PI_IPHONE_COMMAND_LOG = "log"
