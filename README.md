# ClinicalQA

RAG-powered medical document question answering. Upload a clinical PDF or text file, ask questions, get grounded answers with source attribution.

## Stack
- React + Tailwind (frontend, Vercel)
- FastAPI (backend, Railway)
- sentence-transformers all-MiniLM-L6-v2 (embeddings, free/local)
- FAISS (vector store)
- Claude claude-sonnet-4-20250514 (LLM)

## Run Locally

**Backend**
```bash
cd backend
pip install -r requirements.txt
cp .env.example .env  # add your ANTHROPIC_API_KEY
uvicorn main:app --reload
```

**Frontend**
```bash
cd frontend
npm install
cp .env.example .env  # VITE_API_URL=http://localhost:8000
npm run dev
```

## Deploy
- Backend: Railway (connect repo, set ANTHROPIC_API_KEY env var, deploy backend folder)
- Frontend: Vercel (connect repo, set root to frontend, set VITE_API_URL to Railway URL)