# RULES

- Always follow docs/architecture.md
- Follow SRP, DRY, YAGNI and Clean Code; keep code readable and consistently spaced.
- Keep type declarations separate from implementation.
- Use `@/` aliases for internal imports; import from the highest applicable barrel while respecting module boundaries.
- Combine type and value imports from the same module into one declaration using inline `type`.
- Every source directory must contain one barrel named `index.ts`, containing only `export * from` or `export { default as Name } from` declarations.
- Do not use `any`, `unknown`, type assertions or casts.
- Avoid unnecessary functions, including redundant type guards.
- Use ternaries only for very small expressions; prefer explicit conditionals when they improve readability.
- Do not edit generated files directly; change their sources or generation configuration and regenerate them.
- Before delivery, run `npm run validate` (Biome, TypeScript and build). Use `npm run check:fix` for safe formatting fixes; `npm run check`, `npm run typecheck` and `npm run build` are also available individually.
