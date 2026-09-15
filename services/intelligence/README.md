# TrustLens AI — Intelligence Service

Minimal FastAPI service skeleton. Health/status endpoints only — no AI, no NLP, no scoring (AI services land here in a later phase).

## Setup

```powershell
# from services/intelligence/
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
```

## Run

```powershell
.venv\Scripts\python -m uvicorn main:app --port 8000
```

## Endpoints

- `GET /health` → `{"status": "ok"}`
- `GET /status` → service/version/status banner
- `GET /` → service info