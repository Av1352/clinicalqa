import os
print("PORT is:", os.environ.get("PORT"))
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from rag_pipeline import parse_pdf, parse_txt, chunk_text, build_index, retrieve, answer
from dotenv import load_dotenv

load_dotenv()
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

store = {}

@app.get("/health")
def health():
    return {"status": "ok"}

@app.post("/upload")
async def upload(file: UploadFile = File(...)):
    content = await file.read()
    if file.filename.endswith(".pdf"):
        text = parse_pdf(content)
    else:
        text = parse_txt(content)
    chunks = chunk_text(text)
    index, _ = build_index(chunks)
    doc_id = file.filename
    store[doc_id] = {"chunks": chunks, "index": index}
    return {"document_id": doc_id, "chunk_count": len(chunks)}

@app.get("/documents")
def documents():
    return {"documents": list(store.keys())}

class AskRequest(BaseModel):
    document_id: str
    question: str

@app.post("/ask")
def ask(req: AskRequest):
    if req.document_id not in store:
        raise HTTPException(status_code=404, detail="Document not found")
    doc = store[req.document_id]
    sources = retrieve(req.question, doc["chunks"], doc["index"])
    response = answer(req.question, sources)
    return {"answer": response, "sources": sources}

if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run("main:app", host="0.0.0.0", port=port)