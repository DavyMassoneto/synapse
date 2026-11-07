export interface ConfigCase {
  name: string;
  content?: string;
  expected: RegExp;
  invalid?: boolean;
}
