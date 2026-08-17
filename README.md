# F1 APEX Analytics Dashboard

This project consists of a Python FastAPI backend and a static HTML/React frontend.

## Prerequisites

- Python 3.x
- Node.js (for `npx` to serve the static frontend)

## Running the Backend

The backend is built with FastAPI. To start the backend development server on port `8000`:

1. Open a terminal and navigate to the backend directory:
   ```bash
   cd f1-apex/backend
   ```

2. Activate the virtual environment:
   ```powershell
   # On Windows PowerShell (from within the f1-apex/backend directory)
   ..\..\.venv\Scripts\Activate.ps1
   ```
   *(Alternatively, run the server directly without activating: `..\..\.venv\Scripts\python.exe -m uvicorn main:app --reload --port 8000`)*

3. Install requirements (Note: This is a Python backend! Do **not** run `npm install`):
   ```bash
   pip install -r requirements.txt
   ```

4. Start the server using Uvicorn:
   ```bash
   python -m uvicorn main:app --reload --port 8000
   ```
   > The API will be available at `http://127.0.0.1:8000`. You can view the interactive API documentation at `http://127.0.0.1:8000/docs`.

## Running the Frontend

The frontend is a static React/HTML application that can be served using any basic HTTP server.

1. Open a new terminal and navigate to the frontend directory:
   ```bash
   cd f1-apex/frontend
   ```
2. Start a static server on port `8080`:
   ```bash
   npx http-server -p 8080 -c-1
   ```
   > The dashboard will be accessible at `http://127.0.0.1:8080`.
