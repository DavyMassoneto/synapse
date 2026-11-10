# RULES

- Always follow docs/architecture.md
- Always follow docs/standards/legibilidade.md
- Always follow docs/standards/tipagem.md
- Always follow docs/standards/responsabilidade.md
- A folder name states the responsibility of what it holds. Do not name a folder after a broader domain noun when it holds something narrower (a protocol, a transport, a parser); name it after what it does.
- Unit tests belong to the project code. The GitHub automation under `.github/` has no unit tests; it is verified by running it in GitHub Actions.
