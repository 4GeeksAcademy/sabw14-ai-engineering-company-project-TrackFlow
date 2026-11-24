# `services/` — TrackFlow API

Main TrackFlow API (FastAPI). Per decision **D-09** in [`docs/ARCHITECTURE_PROPOSAL.md`](../docs/ARCHITECTURE_PROPOSAL.md) (Spanish), the root of `services/` **is** the API, organized in layers (`routers/` → `domain/` → data). Separately deployed processes will live in `services/workers/<name>/`, each with its own README.

Full documentation (setup, Codespaces, auth flow, tests, security): [`README.es.md`](./README.es.md).

```bash
cd services && cp .env.example .env   # set SECRET_KEY
uv sync && uv run pytest -q
uv run fastapi dev main.py --host 0.0.0.0 --port 8000   # http://localhost:8000/docs
```
