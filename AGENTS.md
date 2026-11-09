# RULES

- Always follow docs/architecture.md
- Always follow docs/standards/legibilidade.md
- Always follow docs/standards/tipagem.md
- Folders have one cohesive, explicit responsibility. Types, constants and helpers live in the folder of the capability that uses them; do not create shared folders grouped by technical category (constants, types, utils). A contract folder is allowed only when it marks an architectural boundary, such as `public/contracts` in docs/architecture.md.
