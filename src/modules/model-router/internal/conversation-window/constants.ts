export const ROUTER_CONTEXT_BYTES = 48_000

export const ROUTER_MESSAGE_BYTES = 18_000

export const ROUTER_MINIMUM_HISTORY_BYTES = 500

export const ROUTER_CLIP_RESERVE_BYTES = 120

export const ROUTER_CLIP_CHAR_DIVISOR = 8

export const ROUTER_OMISSION_MARKER = "\n[conteúdo omitido pelo limite de contexto do classificador]\n"

export const ROUTER_NO_USER_MESSAGE = "[contexto sem pedido de usuário; evidência ausente, não indica tarefa simples]"

export const ROUTER_IMAGE_MARKER = "\n[imagem presente; pixels não enviados ao Jev]\n"

export const ROUTER_IMAGE_NOTICE =
  "Image pixels and private thinking are not included. Omission markers mean missing evidence, not a simple task."

export const ROUTER_USER_ROLE = "user"

export const ROUTER_MESSAGE_BREAK = "\n"

export const ROUTER_CALL_SEPARATOR = ": "

export const ROUTER_RESULT_ERROR_LABEL = " error="

export const ROUTER_HISTORY_INCLUDED = "included"

export const ROUTER_HISTORY_OMITTED = "omitted"
