# RULES

- Always follow docs/architecture.md
- Always follow docs/standards/legibilidade.md
- Always follow docs/standards/tipagem.md
- Always follow docs/standards/responsabilidade.md
- Always follow docs/standards/desempenho.md
- A folder name states what it holds. If it holds HTTP or SSE reading, name it for that; do not name it after the domain noun it serves (for example, `model` for an HTTP client). Name it after what it does.
- Unit tests belong to the project code. The GitHub automation under `.github/` has no unit tests; it is verified by running it in GitHub Actions.
- Do not use `any`, `unknown`, `Record`, type assertions or casts.
- Split complex logic into small, readable functions with clear responsibilities; avoid unnecessary functions and redundant type guards.
- Code written while fixing a finding goes through the same review questions as the code under review, before it is published.
- Every verification includes an input that must be rejected, not only inputs that must work.
