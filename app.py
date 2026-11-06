from pathlib import Path

import requests
from flask import Flask, jsonify, render_template, request
from werkzeug.exceptions import RequestEntityTooLarge
from werkzeug.utils import secure_filename

app = Flask(__name__)
app.config["MAX_CONTENT_LENGTH"] = 51 * 1024 * 1024

OLLAMA_CHAT_URL = "http://localhost:11434/api/chat"
MODEL = "gemma3:1b"
DOCUMENTS_DIR = Path(app.instance_path) / "documents"
MAX_FILE_SIZE = 50 * 1024 * 1024


@app.get("/")
def index():
    return render_template("index.html")


@app.get("/api/documents")
def list_documents():
    DOCUMENTS_DIR.mkdir(parents=True, exist_ok=True)
    files = [
        {"id": path.name, "name": path.name, "size": path.stat().st_size}
        for path in sorted(DOCUMENTS_DIR.glob("*.pdf"), key=lambda item: item.name.lower())
        if path.is_file()
    ]
    return jsonify(files=files)


@app.post("/api/documents")
def upload_document():
    upload = request.files.get("file")
    if upload is None or not upload.filename:
        return jsonify(error="Choose a PDF to upload."), 400

    filename = secure_filename(upload.filename)
    if not filename or Path(filename).suffix.lower() != ".pdf":
        return jsonify(error="Only PDF files can be uploaded."), 400
    filename = f"{Path(filename).stem}.pdf"

    content = upload.stream.read(MAX_FILE_SIZE + 1)
    if len(content) > MAX_FILE_SIZE:
        return jsonify(error="Files must be 50 MB or smaller."), 413
    if not content:
        return jsonify(error="The selected file is empty."), 400

    DOCUMENTS_DIR.mkdir(parents=True, exist_ok=True)
    stem = Path(filename).stem
    stored_name = filename
    suffix = 2
    while (DOCUMENTS_DIR / stored_name).exists():
        stored_name = f"{stem}_{suffix}.pdf"
        suffix += 1
    try:
        (DOCUMENTS_DIR / stored_name).write_bytes(content)
    except OSError:
        app.logger.exception("Could not save uploaded PDF %s", filename)
        return jsonify(error="Could not save the file locally."), 500

    return jsonify(file={"id": stored_name, "name": stored_name, "size": len(content)}), 201


@app.delete("/api/documents/<file_id>")
def delete_document(file_id):
    if (secure_filename(file_id) != file_id
            or Path(file_id).name != file_id
            or Path(file_id).suffix.lower() != ".pdf"):
        return jsonify(error="File not found."), 404
    file_path = DOCUMENTS_DIR / file_id
    try:
        file_path.unlink()
    except FileNotFoundError:
        return jsonify(error="File not found."), 404
    except OSError:
        app.logger.exception("Could not delete PDF %s", file_id)
        return jsonify(error="Could not delete the file."), 500
    return jsonify(ok=True)


@app.errorhandler(RequestEntityTooLarge)
def file_too_large(_error):
    return jsonify(error="Files must be 50 MB or smaller."), 413


@app.post("/api/chat")
def chat():
    data = request.get_json(silent=True)
    messages = data.get("messages") if isinstance(data, dict) else None
    if not isinstance(messages, list) or not messages:
        return jsonify(error="Enter a message to start the conversation."), 400

    clean_messages = []
    for message in messages:
        if not isinstance(message, dict):
            return jsonify(error="Conversation messages must include a role and text."), 400
        role, content = message.get("role"), message.get("content")
        if role not in ("user", "assistant") or not isinstance(content, str):
            return jsonify(error="Conversation messages must use user or assistant roles and text."), 400
        clean_messages.append({"role": role, "content": content})

    try:
        response = requests.post(
            OLLAMA_CHAT_URL,
            json={"model": MODEL, "messages": clean_messages, "stream": False},
            timeout=120,
        )
        response.raise_for_status()
        result = response.json()
        message = result.get("message") if isinstance(result, dict) else None
        answer = message.get("content") if isinstance(message, dict) else None
        if not isinstance(answer, str):
            return jsonify(error="Ollama returned an unexpected response."), 502
        return jsonify(message={"role": "assistant", "content": answer})
    except requests.ConnectionError:
        return jsonify(error="Could not connect to Ollama. Make sure it is running at http://localhost:11434."), 503
    except requests.Timeout:
        return jsonify(error="Ollama took too long to respond. Please try again."), 504
    except requests.HTTPError as exc:
        detail = ""
        try:
            detail = exc.response.json().get("error", "")
        except (ValueError, AttributeError):
            pass
        message = f"Ollama returned an error: {detail}" if detail else "Ollama returned an HTTP error."
        return jsonify(error=message), 502
    except (requests.RequestException, ValueError):
        return jsonify(error="Ollama returned an invalid response. Please try again."), 502


if __name__ == "__main__":
    app.run(host="127.0.0.1", port=5000, debug=False)
