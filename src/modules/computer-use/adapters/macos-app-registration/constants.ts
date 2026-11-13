export const COMPUTER_APP_SIGNATURE_COMMAND = "codesign"

export const COMPUTER_APP_SIGNATURE_VERBOSE_FLAG = "-dv"

export const COMPUTER_APP_REGISTRATION_COMMAND =
  "/System/Library/Frameworks/CoreServices.framework/Frameworks/LaunchServices.framework/Support/lsregister"

export const COMPUTER_APP_REGISTRATION_FLAG = "-f"

export const COMPUTER_APP_BUNDLE_IDENTIFIER = "com.trycua.driver"

export const COMPUTER_APP_TEAM_IDENTIFIERS: string[] = ["4YEC26S9KF", "YCK386LBJ7"]

export const COMPUTER_APP_IDENTIFIER_FIELD = "Identifier"

export const COMPUTER_APP_TEAM_IDENTIFIER_FIELD = "TeamIdentifier"

export const COMPUTER_APP_FIELD_SEPARATOR = "="

export const COMPUTER_APP_LINE_SEPARATOR = "\n"

export const COMPUTER_APP_REGISTERED = "app-registered"

export const COMPUTER_APP_REGISTRATION_REFUSED = "app-registration-refused"

export const COMPUTER_APP_SIGNATURE_FOUND = "signature-field-found"

export const COMPUTER_APP_SIGNATURE_ABSENT = "signature-field-absent"

export const COMPUTER_APP_MACOS_ONLY = "O registro do app do cua-driver só se aplica ao macOS."

export const COMPUTER_APP_SIGNATURE_REJECTED = "A assinatura do CuaDriver.app não confere."

export const COMPUTER_APP_REGISTRATION_FAILED = "Não foi possível registrar o CuaDriver.app no LaunchServices."
