import {
  JSON_BACKSPACE_ESCAPE,
  JSON_COLON,
  JSON_COMMA,
  JSON_CONTROL_LIMIT,
  JSON_ESCAPE,
  JSON_ESCAPES,
  JSON_FORMFEED_ESCAPE,
  JSON_HEX_BASE,
  JSON_HEX_DIGITS,
  JSON_HEX_LENGTH,
  JSON_NEWLINE_ESCAPE,
  JSON_QUOTE,
  JSON_RETURN_ESCAPE,
  JSON_SLASH,
  JSON_TAB_ESCAPE,
  JSON_UNICODE_ESCAPE,
  JSON_WHITESPACE,
} from "./constants"
import { IphoneSimctlSyntaxError } from "./syntax-error"

export class IphoneJsonCursor {
  private position = 0
  private readonly source: string

  constructor(source: string) {
    this.source = source
  }

  peek(): string {
    while (JSON_WHITESPACE.includes(this.source.charAt(this.position))) {
      this.position += 1
    }
    return this.source.charAt(this.position)
  }

  accept(character: string): boolean {
    if (this.peek() === character) {
      this.position += 1
      return true
    }
    return false
  }

  expect(character: string): void {
    if (!this.accept(character)) {
      throw new IphoneSimctlSyntaxError()
    }
  }

  finish(): void {
    if (this.peek().length > 0) {
      throw new IphoneSimctlSyntaxError()
    }
  }

  property(): string {
    const key = this.string(true)
    this.expect(JSON_COLON)
    return key
  }

  next(closing: string): boolean {
    if (this.accept(closing)) {
      return false
    }
    this.expect(JSON_COMMA)
    return true
  }

  string(capture: boolean): string {
    this.expect(JSON_QUOTE)
    let result = ""
    while (this.position < this.source.length) {
      const start = this.position
      this.stringSpan()
      if (capture) {
        result += this.source.slice(start, this.position)
      }
      const character = this.source.charAt(this.position)
      this.position += 1
      if (character === JSON_QUOTE) {
        return result
      }
      if (character !== JSON_ESCAPE) {
        throw new IphoneSimctlSyntaxError()
      }
      const escaped = this.escape()
      if (capture) {
        result += escaped
      }
    }
    throw new IphoneSimctlSyntaxError()
  }

  private stringSpan(): void {
    let character = this.source.charAt(this.position)
    while (character.length > 0 && character !== JSON_QUOTE && character !== JSON_ESCAPE) {
      if (character.charCodeAt(0) < JSON_CONTROL_LIMIT) {
        throw new IphoneSimctlSyntaxError()
      }
      this.position += 1
      character = this.source.charAt(this.position)
    }
  }

  take(characters: string): boolean {
    const character = this.source.charAt(this.position)
    if (character.length > 0 && characters.includes(character)) {
      this.position += 1
      return true
    }
    return false
  }

  literal(text: string): void {
    if (!this.source.startsWith(text, this.position)) {
      throw new IphoneSimctlSyntaxError()
    }
    this.position += text.length
  }

  private escape(): string {
    const character = this.source.charAt(this.position)
    this.position += 1
    switch (character) {
      case JSON_QUOTE:
      case JSON_ESCAPE:
      case JSON_SLASH:
      case JSON_BACKSPACE_ESCAPE:
      case JSON_FORMFEED_ESCAPE:
      case JSON_NEWLINE_ESCAPE:
      case JSON_RETURN_ESCAPE:
      case JSON_TAB_ESCAPE:
        return JSON_ESCAPES[character]
      case JSON_UNICODE_ESCAPE:
        return this.unicode()
      default:
        throw new IphoneSimctlSyntaxError()
    }
  }

  private unicode(): string {
    const start = this.position
    for (let digit = 0; digit < JSON_HEX_LENGTH; digit += 1) {
      if (!this.take(JSON_HEX_DIGITS)) {
        throw new IphoneSimctlSyntaxError()
      }
    }
    return String.fromCharCode(Number.parseInt(this.source.slice(start, this.position), JSON_HEX_BASE))
  }
}
