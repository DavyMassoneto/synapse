export const GIT_LIST_ARGUMENTS = ["-c", "core.quotepath=false", "ls-tree", "-r", "-z", "--name-only"]

export const GIT_SHOW_COMMAND = "show"

export const SOURCE_PATTERN = /\.(?:ts|grit|json)$/

export const LOCKFILE = "package-lock.json"

export const PATH_TERMINATOR = "\0"

export const SOURCE_ENCODING = "utf8"

export const FILE_HEADER = "### "

export const FILE_BREAK = "\n\n"

export const MAX_SOURCE_BYTES = 4_194_304

export const LISTING_SUBJECT = "A lista de arquivos do commit"

export const FILE_SUBJECT = "Um arquivo de código"
