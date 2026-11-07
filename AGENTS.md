# RULES

- Always follow docs/architecture.md
- Follow SRP, DRY, YAGNI and Clean Code; keep code readable and consistently spaced. Write control-flow bodies on separate lines with braces.
- Keep type declarations and constants separate from implementation; do not declare inline object types in implementation. Do not mix standalone functions with class declarations in the same file.
- Use `./` for sibling imports; use `../componente` for a sibling directory barrel, never `../../`. For more distant imports, use the highest applicable directory barrel that does not reexport the consumer: if `#synapse/controller` would cause a cycle, use `#synapse/controller/componente`. Never import individual files across areas. Barrel exports must reference only files or directories in their own directory using relative paths.
- Combine type and value imports from the same module into one declaration using inline `type`; use `import type` for declarations containing only types.
- Every source directory must contain one barrel named `index.ts`, containing only `export * from` or `export { default as Name } from` declarations.
- Do not use `any`, `unknown`, `Record`, type assertions or casts.
- Split complex logic into small, readable functions with clear responsibilities; avoid unnecessary functions and redundant type guards.
- Do not declare functions inside other functions; keep responsibilities separate.
- Use ternaries only for very small expressions; prefer explicit conditionals when they improve readability.
- Do not edit generated files directly; change their sources or generation configuration and regenerate them.
- Compile and typecheck TypeScript with the configured TypeScript compiler; run TypeScript tests with Vitest.
- Before delivery, run `npm run validate` (Biome, TypeScript compilation and tests). Use `npm run check:fix` for safe formatting fixes; `npm run check`, `npm run typecheck` and `npm run build` are also available individually.
