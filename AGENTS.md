# RULES

- Always follow docs/architecture.md
- Always follow docs/standards/legibilidade.md
- Always follow docs/standards/tipagem.md
- Always follow docs/standards/responsabilidade.md
- Always follow docs/standards/desempenho.md
- Follow SRP, DRY, YAGNI and Clean Code; keep code readable and consistently spaced. Write control-flow bodies on separate lines with braces.
- Keep type declarations and constants separate from implementation; do not declare inline object types in implementation. Do not mix standalone functions with class declarations in the same file.
- Do not declare functions inside other functions; keep responsibilities separate.
- Use ternaries only for very small expressions; prefer explicit conditionals when they improve readability.
- Folders have one cohesive, explicit responsibility. Types, constants and helpers live in the folder of the capability that uses them; do not create shared folders grouped by technical category (constants, types, utils). A contract folder is allowed only when it marks an architectural boundary, such as `public/contracts` in docs/architecture.md.
- Imports and barrel exports never include file extensions or `index`. Use `./arquivo` within the same directory, `./componente` or `../componente` for child or sibling directory barrels, never `../../`. For more distant imports, use the highest applicable directory barrel that does not reexport the consumer: if `#synapse/controller` would cause a cycle, use `#synapse/controller/componente`. Never import individual files across areas. Barrel exports must reference only files or directories in their own directory using relative paths.
- Every source directory must contain one barrel named `index.ts`, containing only `export * from` or `export { default as Name } from` declarations.
- A folder name states what it holds. If it holds HTTP or SSE reading, name it for that; do not name it after the domain noun it serves (for example, `model` for an HTTP client). Name it after what it does.
- Unit tests belong to the project code. The GitHub automation under `.github/` has no unit tests; it is verified by running it in GitHub Actions.
- Do not use `any`, `unknown`, `Record`, type assertions or casts.
- Split complex logic into small, readable functions with clear responsibilities; avoid unnecessary functions and redundant type guards.
- Code written while fixing a finding goes through the same review questions as the code under review, before it is published.
- Every verification includes an input that must be rejected, not only inputs that must work.
