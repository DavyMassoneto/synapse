import { type Static, type TSchema } from "typebox"
import { AssertError, Value } from "typebox/value"
import { type ToolCall } from "#evaluator/provider-client"
import {
  INVALID_ARGUMENTS,
  LIST_FILES,
  ListFilesArguments,
  MAX_TOOL_OUTPUT_BYTES,
  READ_FILE,
  ReadFileArguments,
  SEARCH_CODE,
  SearchCodeArguments,
  TOOL_OUTPUT_TOO_LARGE,
  UNKNOWN_TOOL,
} from "./constants"
import { listFiles } from "./list-files"
import { readFile } from "./read-file"
import { searchCode } from "./search-code"
import { type RepositorySnapshot } from "./types"

function parseInspectionArguments<Schema extends TSchema>(call: ToolCall, schema: Schema): Static<Schema> {
  return Value.Parse(schema, JSON.parse(call.function.arguments))
}

function dispatch(snapshot: RepositorySnapshot, call: ToolCall): string {
  switch (call.function.name) {
    case LIST_FILES:
      return listFiles(snapshot, parseInspectionArguments(call, ListFilesArguments).prefix)
    case READ_FILE:
      return readFile(snapshot, parseInspectionArguments(call, ReadFileArguments))
    case SEARCH_CODE:
      return searchCode(snapshot, parseInspectionArguments(call, SearchCodeArguments).text)
    default:
      return `${UNKNOWN_TOOL}${call.function.name}`
  }
}

function inspectionOutput(snapshot: RepositorySnapshot, call: ToolCall): string {
  try {
    return dispatch(snapshot, call)
  } catch (error) {
    if (error instanceof AssertError || error instanceof SyntaxError) {
      return `${INVALID_ARGUMENTS}${error.message}`
    }
    throw error
  }
}

function limitedOutput(output: string): string {
  if (Buffer.byteLength(output) > MAX_TOOL_OUTPUT_BYTES) {
    return TOOL_OUTPUT_TOO_LARGE
  }
  return output
}

export function runInspectionTool(snapshot: RepositorySnapshot, call: ToolCall): string {
  return limitedOutput(inspectionOutput(snapshot, call))
}
