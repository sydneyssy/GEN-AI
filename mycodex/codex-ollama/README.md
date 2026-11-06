# Closet Studio

A local wardrobe workspace powered by Flask and Ollama. Browse inventory from an Excel workbook, review outfit pairs already marked as fully matching in that workbook, and ask the local AI stylist questions grounded in the workbook data.

## Requirements

- Python 3.9 or newer
- [Ollama](https://ollama.com/) installed and running

Pull the chat model if needed:

```bash
ollama pull gemma3:1b
```

## Run locally

Create a virtual environment and install dependencies:

```bash
python3 -m venv .venv
source .venv/bin/activate  # Windows: .venv\Scripts\activate
python -m pip install -r requirements.txt
```

Start the app and open [http://127.0.0.1:5001](http://127.0.0.1:5001):

```bash
python app.py
```

Flask binds to `127.0.0.1` only. Keep Ollama running locally; the interface can load without Ollama, but AI Stylist responses require the model service.

## Workbook format

Upload an `.xlsx` workbook from **Workbook** in the sidebar. The wardrobe view reads an `Inventory` sheet with `Item_ID`, `Category`, `Color`, and `Design_Type` columns. Outfit cards come from rows in `Outfit_Matches` where `Fully_Matching` is `Yes`; the AI Stylist receives workbook content as local context. Excel context is limited to 30,000 characters per chat request.

The included `uploads/GenAI_Data_Sheet.xlsx` provides the initial inventory, criteria, color pairs, shape pairs, and outfit matches. Files stay in the local `uploads/` folder.

## Project files

- `app.py`: Flask routes, workbook parsing, and local Ollama proxy
- `templates/index.html`: Closet Studio page structure
- `static/style.css` and `static/script.js`: responsive interface and interactions
- `uploads/`: local Excel workbook collection
- `requirements.txt`: Python dependencies
