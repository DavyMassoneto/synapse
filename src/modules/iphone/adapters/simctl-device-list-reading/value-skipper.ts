import {
  JSON_ARRAY,
  JSON_ARRAY_END,
  JSON_ARRAY_START,
  JSON_COLON,
  JSON_DECIMAL,
  JSON_DIGITS,
  JSON_EXPONENTS,
  JSON_LITERALS,
  JSON_MINUS,
  JSON_NONZERO_DIGITS,
  JSON_OBJECT,
  JSON_OBJECT_END,
  JSON_OBJECT_START,
  JSON_QUOTE,
  JSON_SIGNS,
  JSON_ZERO,
} from "./constants"
import { type IphoneJsonCursor } from "./cursor"
import { IphoneSimctlSyntaxError } from "./syntax-error"
import { type IphoneJsonContainer } from "./types"

export class IphoneJsonValueSkipper {
  private readonly cursor: IphoneJsonCursor

  constructor(cursor: IphoneJsonCursor) {
    this.cursor = cursor
  }

  skip(): void {
    const containers: IphoneJsonContainer[] = []
    let pending = true
    while (pending) {
      if (!this.value(containers)) {
        pending = this.advance(containers)
      }
    }
  }

  private value(containers: IphoneJsonContainer[]): boolean {
    if (this.cursor.accept(JSON_OBJECT_START)) {
      if (!this.cursor.accept(JSON_OBJECT_END)) {
        containers.push(JSON_OBJECT)
        this.property()
        return true
      }
    } else if (this.cursor.accept(JSON_ARRAY_START)) {
      if (!this.cursor.accept(JSON_ARRAY_END)) {
        containers.push(JSON_ARRAY)
        return true
      }
    } else if (this.cursor.peek() === JSON_QUOTE) {
      this.cursor.string(false)
    } else {
      this.scalar()
    }
    return false
  }

  private advance(containers: IphoneJsonContainer[]): boolean {
    while (containers.length > 0) {
      const container = containers.at(-1)
      const closing = container === JSON_OBJECT ? JSON_OBJECT_END : JSON_ARRAY_END
      if (this.cursor.next(closing)) {
        if (container === JSON_OBJECT) {
          this.property()
        }
        return true
      }
      containers.pop()
    }
    return false
  }

  private property(): void {
    this.cursor.string(false)
    this.cursor.expect(JSON_COLON)
  }

  private scalar(): void {
    const first = this.cursor.peek()
    let matched = false
    for (const literal of JSON_LITERALS) {
      if (literal.startsWith(first) && first.length > 0) {
        this.cursor.literal(literal)
        matched = true
        break
      }
    }
    if (!matched) {
      this.number()
    }
  }

  private number(): void {
    this.cursor.take(JSON_MINUS)
    if (!this.cursor.take(JSON_ZERO)) {
      if (!this.cursor.take(JSON_NONZERO_DIGITS)) {
        throw new IphoneSimctlSyntaxError()
      }
      this.digits()
    }
    if (this.cursor.take(JSON_DECIMAL)) {
      this.requiredDigits()
    }
    if (this.cursor.take(JSON_EXPONENTS)) {
      this.cursor.take(JSON_SIGNS)
      this.requiredDigits()
    }
  }

  private requiredDigits(): void {
    if (!this.cursor.take(JSON_DIGITS)) {
      throw new IphoneSimctlSyntaxError()
    }
    this.digits()
  }

  private digits(): void {
    while (this.cursor.take(JSON_DIGITS)) {}
  }
}
