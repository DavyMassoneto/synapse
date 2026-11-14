export const IPHONE_WDA_IPV4_LOOPBACK = "127.0.0.1"
export const IPHONE_WDA_IPV6_LOOPBACK = "::1"
export const IPHONE_WDA_IPV4_WILDCARD = "0.0.0.0"
export const IPHONE_WDA_IPV6_WILDCARD = "::"
export const IPHONE_WDA_LINUX = "linux"
export const IPHONE_WDA_LINUX_BIND_HOSTS = [IPHONE_WDA_IPV4_WILDCARD, IPHONE_WDA_IPV6_WILDCARD]
export const IPHONE_WDA_DEFAULT_BIND_HOSTS = [
  IPHONE_WDA_IPV4_LOOPBACK,
  IPHONE_WDA_IPV6_LOOPBACK,
  IPHONE_WDA_IPV4_WILDCARD,
  IPHONE_WDA_IPV6_WILDCARD,
]
export const IPHONE_WDA_ERROR_EVENT = "error"
export const IPHONE_WDA_LISTENING_EVENT = "listening"
export const IPHONE_WDA_CLOSE_EVENT = "close"
export const IPHONE_WDA_REQUIRED = "required"
export const IPHONE_WDA_EXTERNAL = "external"
export const IPHONE_WDA_ENDPOINT_BUSY =
  "A porta WDA está ocupada ou já reservada por outra sessão deste processo; nenhuma sessão Appium foi criada."
