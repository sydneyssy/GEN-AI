# Repository Guidelines

Welcome to `codex-ollama`. This document provides guidelines for contributors to ensure consistency, quality, and maintainability across the codebase.

## Project Structure & Module Organization
The repository is organized to separate core logic from configuration and tests:
- `src/`: Primary source code.
- `tests/`: Unit and integration tests.
- `docs/`: Project documentation and architecture guides.
- `config/`: Environment and model configurations.

## Build, Test, and Development Commands
Ensure you have the necessary runtime environment installed before executing these commands:
- `make install`: Install project dependencies.
- `make build`: Compile or bundle the application for local use.
- `make test`: Execute the full test suite to verify stability.
- `make run`: Launch the application in development mode.

## Coding Style & Naming Conventions
We prioritize readability and maintainability:
- **Indentation**: Use 2 spaces for indentation.
- **Naming**: Use `camelCase` for variables and functions, and `PascalCase` for classes or types.
- **Linting**: Run `npm run lint` or the equivalent project linter before submitting changes to ensure style compliance.
- **Documentation**: Every public function must include a brief docstring explaining its purpose and parameters.

## Testing Guidelines
Quality is a shared responsibility:
- **Framework**: We use a standard testing framework (e.g., Jest, PyTest) located in the `tests/` directory.
- **Naming**: Test files should follow the pattern `[module].test.[ext]`.
- **Coverage**: New features must include accompanying tests. Aim for a minimum of 80% branch coverage.

## Commit & Pull Request Guidelines
To maintain a clean history, please follow these steps:
- **Commits**: Use descriptive, imperative-mood messages (e.g., `feat: add Ollama API wrapper` or `fix: resolve timeout in model loading`).
- **Pull Requests**: 
  - Provide a clear description of the changes.
  - Link any related issues (e.g., `Closes #123`).
  - Include screenshots or logs for UI changes or critical bug fixes.
  - Ensure all tests pass in the CI pipeline before requesting a review.
