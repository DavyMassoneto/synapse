import { type AdvisorRenderTheme } from "#synapse/integration";

export class PlainTheme implements AdvisorRenderTheme {
  fg(_color: Parameters<AdvisorRenderTheme["fg"]>[0], text: string): string {
    return text;
  }
  bold(text: string): string {
    return text;
  }
}
