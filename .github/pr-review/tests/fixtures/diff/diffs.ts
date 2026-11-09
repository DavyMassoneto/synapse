export const SECTION_WITH_CONTEXT = [
  "a/src/a.ts b/src/a.ts",
  "index 111..222 100644",
  "--- a/src/a.ts",
  "+++ b/src/a.ts",
  "@@ -1,3 +10,4 @@ heading",
  " context",
  "-removed",
  "+added one",
  "+added two",
  " tail",
  "@@ -20 +30,2 @@ second hunk",
  "+second",
  " kept",
  "\\ No newline at end of file",
].join("\n")
export const LOCK_SECTION = [
  "a/package-lock.json b/package-lock.json",
  "--- a/package-lock.json",
  "+++ b/package-lock.json",
  "@@ -1 +1 @@",
  "-x",
  "+y",
].join("\n")
export const DELETED_SECTION = ["a/old.ts b/old.ts", "--- a/old.ts", "+++ /dev/null", "@@ -1 +0,0 @@", "-gone"].join(
  "\n",
)
export const QUOTED_DELETED_SECTION = [
  "a/x y.ts b/x y.ts",
  '--- "a/x y.ts"\t',
  "+++ /dev/null",
  "@@ -1 +0,0 @@",
  "-gone",
].join("\n")
export const QUOTED_SECTION = [
  "a/x y.ts b/x y.ts",
  '--- "a/x y.ts"',
  '+++ "b/x y.ts"\t',
  "@@ -0,0 +1 @@",
  "+only",
].join("\n")
export const RENAME_SECTION = [
  "a/old.ts b/new.ts",
  "similarity index 100%",
  "rename from old.ts",
  "rename to new.ts",
].join("\n")
export const PACKAGE_SECTION = [
  "a/package.json b/package.json",
  "--- a/package.json",
  "+++ b/package.json",
  "@@ -0,0 +1,2 @@",
  "+um",
  "+dois",
].join("\n")
