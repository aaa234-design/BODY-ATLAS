# BODY ATLAS — Human Biology Explorer

A responsive educational web app for exploring human organs and body systems. Built with Python, Flask, SQLite, HTML, CSS and vanilla JavaScript.

## Features
- Organ explorer with live search and body-system filtering
- Organ detail panels: location, function, key facts and reference notes
- Body systems overview
- Interactive biology quiz with answer feedback and score
- SQLite database initialised automatically on first run
- Responsive dark science-inspired interface

## Requirements
- Python 3.10+
- pip

## Run locally (VS Code)

1. Clone the repository:
   ```bash
   git clone https://github.com/aaa234-design/BODY-ATLAS.git
   cd BODY-ATLAS
   ```
2. Create and activate a virtual environment:

   Windows PowerShell:
   ```powershell
   py -m venv venv
   .\venv\Scripts\Activate.ps1
   ```

   Windows Command Prompt:
   ```bat
   venv\Scripts\activate
   ```

   macOS / Linux:
   ```bash
   python3 -m venv venv
   source venv/bin/activate
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Start the app:
   ```bash
   python app.py
   ```
5. Open **http://127.0.0.1:5000** in your browser.

## API
- `GET /api/organs` — list organs; optional `q` and `system` filters
- `GET /api/organs/<id>` — details for one organ
- `GET /api/systems` — available body systems
- `GET /api/quiz` — quiz questions
- `POST /api/quiz/check` — check an answer
- `GET /health` — health check

## Project structure
```
BODY-ATLAS/
├── app.py
├── requirements.txt
├── body_atlas.db        # generated automatically
├── templates/
│   └── index.html
├── static/
│   ├── style.css
│   └── app.js
└── README.md
```

## Educational note
This project is intended for learning and science-exhibition demonstration. It is not a diagnostic or medical decision-making tool. Anatomy facts are simplified for introductory study; consult trusted biology and medical references for advanced study.
