# Local Ollama Chat

A minimal local web app for chatting with Ollama's `gemma3:1b` model and managing a local PDF collection. Flask sends chat requests to Ollama; the browser keeps conversation history in memory and submits it with each message. PDFs are stored under Flask's local `instance/documents/` directory. The app uses no database, embeddings, or document retrieval.

## Requirements

- Python 3.9 or newer
- [Ollama](https://ollama.com/) installed and running
- The model downloaded locally:

  ```bash
  ollama pull gemma3:1b
  ```

## Setup

From this directory, create and activate a virtual environment, then install dependencies:

```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

## Run

Start the app with:

```bash
python app.py
```

Open <http://127.0.0.1:5000> in your browser. Flask binds to `127.0.0.1` only. Ollama must be available at `http://localhost:11434`; responses are non-streaming. Conversation history stays in the current browser page and is cleared when you reload or select **New chat**. The **Document manager** tab accepts PDF files up to 50 MB and lets you delete them from local storage; uploaded files are not sent to Ollama.
