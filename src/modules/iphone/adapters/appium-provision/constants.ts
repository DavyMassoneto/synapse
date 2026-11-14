export const IPHONE_PROVISION_APPIUM_VERSION = "3.9.0"

export const IPHONE_PROVISION_DRIVER_VERSION = "12.22.8"

export const IPHONE_PROVISION_APPIUM_INTEGRITY =
  "sha512-OGOk9PURzjLoaP76Vm7gbZ4xK6MSskX64xHwMNs+g8gMbW+EHPoN2uFJRLGWW0ChaanhJklwux01BTg1gz4RqA=="

export const IPHONE_PROVISION_DRIVER_INTEGRITY =
  "sha512-aLZLEAXQe8HXiP197tmg/WvVPZ2T8DFnOQaq1wJi6NejMLdtS6FK2+LrmMJADNp0mXxxeCgYMntBIqQnwLuTqw=="

export const IPHONE_PROVISION_REGISTRY = "https://registry.npmjs.org/"

export const IPHONE_PROVISION_DIRECTORY = "managed-appium-3.9.0-xcuitest-12.22.8"

export const IPHONE_PROVISION_HOME = "home"

export const IPHONE_PROVISION_ACTIVE = "active.json"

export const IPHONE_PROVISION_READY = "ready.json"

export const IPHONE_PROVISION_NODE_MODULES = "node_modules"

export const IPHONE_PROVISION_APPIUM_PACKAGE = "appium"

export const IPHONE_PROVISION_DRIVER_PACKAGE = "appium-xcuitest-driver"

export const IPHONE_PROVISION_APPIUM_ENTRY = "index.js"

export const IPHONE_PROVISION_PACKAGE_JSON = "package.json"

export const IPHONE_PROVISION_PACKAGE_LOCK = "package-lock.json"

export const IPHONE_PROVISION_NPM = "npm"

export const IPHONE_PROVISION_WINDOWS_NPM = "npm.cmd"

export const IPHONE_PROVISION_NPM_MINIMUM = 10

export const IPHONE_PROVISION_NODE_20 = 20

export const IPHONE_PROVISION_NODE_22 = 22

export const IPHONE_PROVISION_NODE_24 = 24

export const IPHONE_PROVISION_NODE_20_MINOR = 19

export const IPHONE_PROVISION_NODE_22_MINOR = 12

export const IPHONE_PROVISION_VERSION_PATTERN = /^(\d+)\.(\d+)\.(\d+)$/

export const IPHONE_PROVISION_UUID_PATTERN = "^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$"

export const IPHONE_PROVISION_OUTPUT_BYTES = 2_097_152

export const IPHONE_PROVISION_COMMAND_TIMEOUT_MS = 600_000

export const IPHONE_PROVISION_FILE_BYTES = 4_194_304

export const IPHONE_PROVISION_FILE_MODE = 0o600

export const IPHONE_PROVISION_DIRECTORY_MODE = 0o700

export const IPHONE_PROVISION_VERSION_ARGUMENTS = ["--version"]

export const IPHONE_PROVISION_LIST_ARGUMENTS = ["driver", "list", "--installed", "--json"]

export const IPHONE_PROVISION_ENVIRONMENT_PATTERN = /^(npm_config_|node_env$|node_options$|appium_|path$)/i

export const IPHONE_PROVISION_SCRIPT_FAILURE =
  "O provisionamento do Appium falhou; a instalação parcial não foi publicada."

export const IPHONE_PROVISION_MANIFEST_PATH = "node_modules/.cache/appium/extensions.yaml"

export const IPHONE_PROVISION_HASH_PATH = "node_modules/.cache/appium/package.hash"

export const IPHONE_PROVISION_RECEIPT_FILES = [
  "package.json",
  "package-lock.json",
  "node_modules/appium/package.json",
  "node_modules/appium/index.js",
  "node_modules/appium/build/lib/main.js",
  "node_modules/appium-xcuitest-driver/package.json",
  "node_modules/appium-xcuitest-driver/build/lib/index.js",
  IPHONE_PROVISION_MANIFEST_PATH,
  IPHONE_PROVISION_HASH_PATH,
]

export const IPHONE_PROVISION_HASH_ALGORITHM = "sha256"

export const IPHONE_PROVISION_HASH_ENCODING = "hex"

export const IPHONE_PROVISION_CACHE = "npm-cache"

export const IPHONE_PROVISION_INSTALL_ARGUMENTS = [
  "install",
  "--save-exact",
  "--package-lock=true",
  "--ignore-scripts=false",
  "--engine-strict=true",
  "--no-audit",
  "--no-fund",
  `--registry=${IPHONE_PROVISION_REGISTRY}`,
  `appium@${IPHONE_PROVISION_APPIUM_VERSION}`,
]

export const IPHONE_PROVISION_DRIVER_ARGUMENTS = ["driver", "install", `xcuitest@${IPHONE_PROVISION_DRIVER_VERSION}`]

export const IPHONE_PROVISION_EMPTY_PACKAGE = '{"private":true,"dependencies":{}}\n'

export const IPHONE_PROVISION_EMPTY_NPMRC = ""

export const IPHONE_PROVISION_NPMRC = "user.npmrc"

export const IPHONE_PROVISION_GLOBAL_NPMRC = "global.npmrc"

export const IPHONE_PROVISION_NODE_UNSUPPORTED =
  "O Appium gerenciado exige Node.js ^20.19.0, ^22.12.0 ou >=24.0.0; a versão atual não é compatível."

export const IPHONE_PROVISION_NPM_UNSUPPORTED =
  "O Appium gerenciado exige npm >=10 disponível no PATH informado. Instale uma distribuição compatível do Node.js com npm."

export const IPHONE_PROVISION_EXPLICIT_HOME =
  "APPIUM_HOME foi configurado explicitamente, mas não há Appium no PATH informado. Esse diretório não será alterado automaticamente."

export const IPHONE_PROVISION_INVALID_INSTALLATION =
  "A instalação gerenciada do Appium está incompleta ou é incompatível; nenhum servidor ou diretório externo foi alterado."

export const IPHONE_PROVISION_INVALID_REGISTRY =
  "O registro do Appium não confirmou o driver XCUITest gerenciado na versão e no caminho esperados."

export const IPHONE_PROVISION_INVALID_PATH =
  "O caminho da instalação gerenciada não é um diretório privado regular válido."

export const IPHONE_PROVISION_LINK_UNSUPPORTED =
  "Não foi possível publicar atomicamente a instalação gerenciada; o sistema de arquivos precisa permitir hard links no diretório de estado."

export const IPHONE_PROVISION_WINDOWS = "win32"

export const IPHONE_PROVISION_UTF8 = "utf8"

export const IPHONE_PROVISION_DATA_EVENT = "data"

export const IPHONE_PROVISION_ERROR_EVENT = "error"

export const IPHONE_PROVISION_CLOSE_EVENT = "close"

export const IPHONE_PROVISION_ABORT_EVENT = "abort"

export const IPHONE_PROVISION_TASKKILL = "taskkill"

export const IPHONE_PROVISION_PID_ARGUMENT = "/pid"

export const IPHONE_PROVISION_TREE_ARGUMENT = "/T"

export const IPHONE_PROVISION_FORCE_ARGUMENT = "/F"

export const IPHONE_PROVISION_FORCE_SIGNAL = "SIGKILL"

export const IPHONE_PROVISION_TERMINATION_GRACE_MS = 1000

export const IPHONE_PROVISION_CANCELLED = "cancelamento solicitado"

export const IPHONE_PROVISION_TIMED_OUT = "prazo do comando excedido"

export const IPHONE_PROVISION_OUTPUT_EXCEEDED = "limite de saída do comando excedido"

export const IPHONE_PROVISION_TREE_UNCERTAIN =
  "O término da árvore de processos é incerto; a instalação parcial não foi publicada e foi preservada em"

export const IPHONE_PROVISION_TRUE = "true"

export const IPHONE_PROVISION_FALSE = "false"
