import { Type } from "typebox"
import { FUNCTION_TYPE, type ToolDefinition } from "#evaluator/provider-client"

export const LIST_FILES = "list_files"

export const READ_FILE = "read_file"

export const SEARCH_CODE = "search_code"

export const ListFilesArguments = Type.Object({ prefix: Type.String() })

export const ReadFileArguments = Type.Object({
  path: Type.String({ minLength: 1 }),
  startLine: Type.Integer({ minimum: 1 }),
  endLine: Type.Integer({ minimum: 1 }),
})

export const MIN_SEARCH_TEXT_LENGTH = 2

export const SearchCodeArguments = Type.Object({ text: Type.String({ minLength: MIN_SEARCH_TEXT_LENGTH }) })

export const MAX_TOOL_OUTPUT_BYTES = 65_536

export const TOOL_OUTPUT_TOO_LARGE = `A resposta da ferramenta excede ${MAX_TOOL_OUTPUT_BYTES} bytes; refine o prefixo, o intervalo de linhas ou o texto pesquisado.`

export const MAX_LISTED_FILES = 500

export const MAX_READ_LINES = 400

export const MAX_SEARCH_MATCHES = 100

export const INSPECTION_TOOLS: ToolDefinition[] = [
  {
    type: FUNCTION_TYPE,
    function: {
      name: LIST_FILES,
      description: `Lista os arquivos do commit avaliado cujo caminho começa com prefix ("" lista todos), até ${MAX_LISTED_FILES} por chamada.`,
      parameters: ListFilesArguments,
    },
  },
  {
    type: FUNCTION_TYPE,
    function: {
      name: READ_FILE,
      description: `Lê as linhas startLine a endLine de um arquivo do commit avaliado, numeradas, até ${MAX_READ_LINES} linhas por chamada.`,
      parameters: ReadFileArguments,
    },
  },
  {
    type: FUNCTION_TYPE,
    function: {
      name: SEARCH_CODE,
      description: `Procura o texto literal em todos os arquivos do commit avaliado e devolve caminho, linha e conteúdo de até ${MAX_SEARCH_MATCHES} ocorrências.`,
      parameters: SearchCodeArguments,
    },
  },
]

export const GIT_LIST_ARGUMENTS = ["-c", "core.quotepath=false", "ls-tree", "-r", "-z", "--name-only"]

export const GIT_SHOW = "show"

export const GIT_GREP_ARGUMENTS = ["-c", "core.quotepath=false", "grep", "-n", "-I", "-F", "-e"]

export const NO_MATCH_STATUS = 1

export const PATH_TERMINATOR = "\0"

export const LINE_BREAK = "\n"

export const LINE_NUMBER_BREAK = "  "

export const REVISION_SEPARATOR = ":"

export const LISTING_SUBJECT = "A lista de arquivos do commit"

export const FILE_SUBJECT = "O arquivo lido"

export const SEARCH_SUBJECT = "O resultado da busca"

export const UNKNOWN_TOOL = "Ferramenta desconhecida: "

export const INVALID_ARGUMENTS = "Argumentos inválidos: "

export const UNKNOWN_PATH = "Arquivo inexistente no commit avaliado: "

export const INVALID_RANGE = "Intervalo inválido: endLine é menor que startLine"

export const NO_FILES = "Nenhum arquivo começa com: "

export const SEARCH_TOO_LARGE = "A busca excedeu o limite de leitura; refine o texto pesquisado."

export const NO_MATCHES = "Nenhuma ocorrência de: "

export const MORE_FILES = "... há mais arquivos; use um prefixo mais específico"

export const MORE_LINES = "... o arquivo continua na linha "

export const MORE_MATCHES = "... há mais ocorrências; refine a busca"
