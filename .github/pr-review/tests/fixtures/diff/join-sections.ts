export function joinSections(...sections: string[]): string {
  return `diff --git ${sections.join("\ndiff --git ")}\n`
}
