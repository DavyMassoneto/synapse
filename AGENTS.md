# RULES

- Always follow docs/architecture.md
- Always follow docs/standards/legibilidade.md
- Always follow docs/standards/tipagem.md
- Always follow docs/standards/responsabilidade.md
- A folder name states what it holds. If it holds HTTP or SSE reading, name it for that; do not name it after the domain noun it serves (for example, `model` for an HTTP client). Name it after what it does.
- Unit tests belong to the project code. The GitHub automation under `.github/` has no unit tests; it is verified by running it in GitHub Actions.
