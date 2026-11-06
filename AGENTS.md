# Repository Guidelines

## Project Structure & Module Organization

This is a small Flask application that connects a browser chat interface to a local Ollama model. The documented entry point is `src/app.py`; its page and styles live in `src/templates/` and `src/static/`. The repository also contains a fuller root-level `app.py` with document upload and chat routes, plus `templates/` and `static/` for that interface. Keep changes with the entry point and UI they serve, and avoid duplicating behavior across these two app layouts. Runtime document data belongs under Flask's instance directory, not in source control. There is currently no test directory.

## Build, Test, and Development Commands

Create and activate a virtual environment, then install declared dependencies:

```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

The README's development command is `python src/app.py`; it serves the app at `http://127.0.0.1:5000`. Ollama must be running locally, with `gemma3:1b` available (`ollama pull gemma3:1b`). No build or test command is configured yet. Keep `requirements.txt` in sync when adding Python dependencies.

## Coding Style & Naming Conventions

Use Python 3 with four spaces per indentation level, descriptive `snake_case` names, and small Flask route/helper functions. Keep templates in HTML and browser behavior in JavaScript/CSS under the corresponding `templates/` and `static/` directories. Preserve existing endpoint paths and return JSON errors consistently for API failures. No formatter or linter is configured.

## Testing Guidelines

There is no automated test suite or coverage requirement in the current project. For changes to routes, validate the affected behavior locally; for chat, confirm the Ollama service and configured model are available. When adding tests, place them in `tests/`, use `test_*.py` names, and document the command used to run them.

## Commit & Pull Request Guidelines

Git history is unavailable in this checkout, so no repository-specific commit convention can be confirmed. Use concise imperative subjects such as `Handle Ollama timeouts`. Pull requests should describe the user-visible change and motivation, list validation performed, link related issues when relevant, and include screenshots for interface changes.

## Security & Configuration

Keep credentials and machine-specific settings out of commits. Treat uploaded files and extracted text as untrusted input, preserve file type and size checks, and keep user documents in runtime storage. Document configuration changes and provide safe examples without secrets.
