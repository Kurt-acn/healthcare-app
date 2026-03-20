# Healthcare RAG Chat Application
_Last updated: 2026-03-20_

**Frontend (Azure Static Web Apps):** https://zealous-river-0d94b310f.4.azurestaticapps.net/

**Backend (Azure App Service):** https://hc-api-rag.azurewebsites.net (Docs: https://hc-api-rag.azurewebsites.net/docs)

## 1) Overview

This project is a **Healthcare Retrieval‑Augmented Generation (RAG)** web application. It retrieves data from **Azure AI Search** and generates **grounded** answers via **Azure OpenAI**, returning **citations** used to form the response.

### Key capabilities
- Multi‑turn chat (conversation-style, not single Q&A)
- Chat history persists across browser refresh
- Search across **structured** (JSON/CSV-like rows) and **unstructured** (PDF/DOCX/TXT) sources in one index
- Answers constrained to retrieved sources + citations

## 2) Architecture (Plan B1)

- **Frontend:** Azure Static Web Apps (SWA) hosts the React/Vite build
- **Backend:** Azure App Service hosts FastAPI (Python 3.12) and keeps secrets server-side

```text
Browser
  │
  ▼
Azure Static Web Apps (React/Vite)
  │  POST /chat (HTTPS)
  ▼
Azure App Service (FastAPI, Python 3.12)
  │
  ├─ Azure AI Search (retrieval)
  └─ Azure OpenAI (generation)
```

### Endpoints
- `GET /health` — health check
- `POST /ask` — single‑turn Q&A (legacy)
- `POST /chat` — multi‑turn chat

### Environment variables (local vs cloud)
- **Local:** `.env` (ignored by git)
- **Cloud:** App Service → Configuration → Environment variables

## 5) CI/CD (SWA)

Azure Static Web Apps builds and deploys from GitHub Actions. Ensure the workflow uses:
- `app_location: ./frontend`
- `output_location: dist`
- no `api_location` (unless using Azure Functions)