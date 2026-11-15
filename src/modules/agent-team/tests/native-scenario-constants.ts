import { type ShellTestStdioOptions } from "./native-test-types"

export const SHELL_TEST_WINDOWS_PLATFORM = "win32"
export const SHELL_DIRECTORY_MODE_PREFIX = "launcher-directory-"
export const SHELL_DIRECTORY_KIND_PREFIX = "launcher-directory-kind-"
export const SHELL_DIRECTORY_TARGET = "target"
export const SHELL_DIRECTORY_LINK = "link"
export const SHELL_DIRECTORY_FILE = "file"
export const SHELL_DIRECTORY_FILE_CONTENT = "not a directory"
export const SHELL_TEST_FRAGMENT_DELAY_MS = 100

export const SHELL_TEST_EXEC_NOT_FOUND = "No such file or directory"
export const SHELL_TEST_EXIT_ZERO_COMMAND = "exit 0"
export const SHELL_TEST_FORBIDDEN_COMMAND = "printf forbidden"
export const SHELL_TEST_FOREGROUND_COMMAND = "printf foreground"
export const SHELL_TEST_FOREGROUND_OUTPUT = "foreground"
export const SHELL_TEST_FOREGROUND_BACKGROUND_COMMAND = "printf foreground; sleep 8 &"
export const SHELL_TEST_LARGE_COMMAND = "head -c 200000 /dev/zero"
export const SHELL_TEST_LARGE_BACKGROUND_COMMAND = "head -c 200000 /dev/zero; sleep 8 &"
export const SHELL_TEST_CURRENT_GENERATION_COMMAND = "printf CURRENT_EXECUTED"
export const SHELL_TEST_ISOLATED_OUTPUT = "ISOLATED"
export const SHELL_TEST_SIGNAL_STOP = "SIGSTOP"
export const SHELL_TEST_SIGNAL_CONTINUE = "SIGCONT"

export const SHELL_BARRIER_STDIO: ShellTestStdioOptions = ["ignore", "pipe", "pipe", "pipe", "pipe"]
export const SHELL_BARRIER_CONTROL_FD = 3
export const SHELL_BARRIER_READY_FD = 1
export const SHELL_BARRIER_READY_BYTE = 5
export const SHELL_BARRIER_RELEASE_BYTE = 1
export const SHELL_BARRIER_MAX_ATTEMPTS = 100
export const SHELL_BARRIER_PS_PATH = "/bin/ps"
export const SHELL_BARRIER_PS_ARGUMENT = "-p"
export const SHELL_BARRIER_PS_OUTPUT_ARGUMENT = "-o"
export const SHELL_BARRIER_PS_FORMAT = "stat=,command="
export const SHELL_BARRIER_PS_ENCODING = "utf8"
export const SHELL_TEST_PIPE_RESET = "ECONNRESET"
export const SHELL_BARRIER_ZOMBIE_PATTERN = /^Z|<defunct>/

export const SHELL_ARTIFACT_HOST = "127.0.0.1"
export const SHELL_ARTIFACT_PORT_AUTOMATIC = 0
export const SHELL_ARTIFACT_LISTENING = "listening"
export const SHELL_ARTIFACT_URL_PREFIX = "http://127.0.0.1:"
export const SHELL_ARTIFACT_URL_SUFFIX = "/"
export const SHELL_ARTIFACT_SUCCESS = 200
export const SHELL_ARTIFACT_CONTENT_LENGTH = "content-length"

export const SHELL_TEST_HEX_ENCODING = "hex"
export const SHELL_TEST_PREPARATION_EMPTY = "preparation-empty"
export const SHELL_TEST_PREPARATION_CANCELLED = "cancelled"
export const SHELL_TEST_READER_CREATED = "created"
export const SHELL_TEST_READER_COMPLETED = "completed"
export const SHELL_TEST_MIXED_PREFIXES = ["0200", "0400", "020000", "040002"]
export const SHELL_TEST_BAD_PREPARATION_FRAMES = ["05020000", "050000", "0500000003", "05010001ff"]
export const SHELL_TEST_BAD_CLOSE_FRAMES = ["02000000000000001d", "02000000000000001d0303", "03000000000000001d02"]

export const SHELL_IDENTITY_TEMP_PREFIX = "native-identity-"
export const SHELL_IDENTITY_PERMISSIONS_PREFIX = "native-permissions-"
export const SHELL_IDENTITY_FILE = "launcher"
export const SHELL_IDENTITY_SCRIPT_PREFIX = "#!/bin/sh\nprintf '%s\\n' '"
export const SHELL_IDENTITY_SCRIPT_SUFFIX = "'\n"
export const SHELL_IDENTITY_NOT_EXECUTED = "not executed"
export const SHELL_TEST_SHA256 = "sha256"
export const SHELL_TEST_NO_ARCHIVE_HASH = ""
export const SHELL_IDENTITY_INVALID_OUTPUTS = [
  "synapse-unix-launcher-v0 darwin arm64 1",
  "synapse-unix-launcher-v1 wrong arm64 1",
  "synapse-unix-launcher-v1 darwin wrong 1",
  "synapse-unix-launcher-v1 darwin arm64 0",
]

export const SHELL_TEST_STATE_QUARANTINED = "quarantined"
export const SHELL_TEST_STATE_EXITED = "exited"
export const SHELL_TEST_CLOCK_METHOD = "bigint"
export const SHELL_REQUIREMENT_MISSING_COMMAND = "synapse-powershell-not-installed"
export const SHELL_REQUIREMENT_POWERSHELL = "powershell.exe"
export const SHELL_REQUIREMENT_ADD_TYPE_ERROR = "Add-Type funcional"
export const SHELL_REQUIREMENT_PLATFORM_PROPERTY = "platform"
export const SHELL_REQUIREMENT_GETTER = "get"
export const SHELL_REQUIREMENT_UNSUPPORTED_PLATFORM = "aix"
export const SHELL_REQUIREMENT_UNSUPPORTED_ERROR = "apenas em macOS, Linux e Windows"
export const SHELL_PROBE_WRONG_MARKER = "WRONG_MARKER"
export const SHELL_PROBE_COMPILER_ERROR = "Compiler rejected source"
export const SHELL_PROBE_EXPECT_CODE = "code=0"
export const SHELL_PROBE_EXPECT_KILLED = "killed=false"
export const SHELL_PROBE_EXPECT_STDERR = "stderr=Compiler rejected source"
export const SHELL_PROBE_EXPECT_STDOUT = "stdout=WRONG_MARKER"

export const SHELL_PROVISION_CACHE_PREFIX = "native-cache-"
export const SHELL_PROVISION_LINK_PREFIX = "native-link-"
export const SHELL_PROVISION_DOWNLOAD_PREFIX = "native-download-"
export const SHELL_PROVISION_SUCCESS_PREFIX = "native-download-ok-"
export const SHELL_PROVISION_CANCEL_PREFIX = "native-download-cancel-"
export const SHELL_PROVISION_FILE = "launcher"
export const SHELL_PROVISION_TARGET = "target"
export const SHELL_PROVISION_PUBLISHED = "published"
export const SHELL_PROVISION_BAD_BINARY = "not executable"
export const SHELL_PROVISION_BAD_ARCHIVE = "corrupt archive"
export const SHELL_PROVISION_UNUSED_ARCHIVE = "not used"
export const SHELL_PROVISION_CANCELLED = "cancelled provision"

export const SHELL_TEST_DARWIN_PLATFORM = "darwin"
export const SHELL_PHASE_TEXT_ENCODING = "utf8"
export const SHELL_PHASE_MARKER_POLL_MS = 1

export const SHELL_ZOMBIE_DIRECTORY_PREFIX = "native-zombie-"
export const SHELL_ZOMBIE_EXECUTABLE = "fixture"
export const SHELL_ZOMBIE_SOURCE = "native-zombie-fixture.c"
export const SHELL_ZOMBIE_OPTIMIZE = "-O2"
export const SHELL_ZOMBIE_EXEC_PREFIX = "exec '"
export const SHELL_ZOMBIE_EXEC_SUFFIX = "'"

export const SHELL_FIXTURE_CLOSE_TIMEOUT_ERROR = "processo da fixture não encerrou dentro do prazo"

export const SHELL_BARRIER_POLL_MS = 10

export const SHELL_BARRIER_STATUS_RUNNING = "Rs keeper-barrier.ts"
export const SHELL_BARRIER_STATUS_ZOMBIE = "Z keeper-barrier.ts"
export const SHELL_BARRIER_STATUS_RUNNING_TITLE = "processo ativo R não é tratado como morto"
export const SHELL_BARRIER_STATUS_ZOMBIE_TITLE = "processo zumbi não satisfaz barreira"
