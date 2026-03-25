import fitz
import numpy as np
import faiss
import os
from dotenv import load_dotenv
from sentence_transformers import SentenceTransformer
from anthropic import Anthropic

model = SentenceTransformer("all-MiniLM-L6-v2")
load_dotenv()
client = Anthropic(api_key=os.getenv("ANTHROPIC_API_KEY"))

CLINICAL_PROMPT = """You are a clinical AI assistant analyzing medical documents.
Answer the question based ONLY on the provided context from the medical document.
If the answer is not in the context, say "This information is not found in the document."
Be precise, use clinical language, and cite specific details.

Context:
{context}

Question: {question}

Answer:"""

def chunk_text(text, chunk_size=400, overlap=50):
    words = text.split()
    chunks = []
    i = 0
    while i < len(words):
        chunk = " ".join(words[i:i+chunk_size])
        chunks.append(chunk)
        i += chunk_size - overlap
    return chunks

def parse_pdf(file_bytes):
    doc = fitz.open(stream=file_bytes, filetype="pdf")
    text = ""
    for page in doc:
        text += page.get_text()
    return text

def parse_txt(file_bytes):
    return file_bytes.decode("utf-8")

def build_index(chunks):
    embeddings = model.encode(chunks, convert_to_numpy=True)
    embeddings = embeddings / np.linalg.norm(embeddings, axis=1, keepdims=True)
    dim = embeddings.shape[1]
    index = faiss.IndexFlatIP(dim)
    index.add(embeddings)
    return index, embeddings

def retrieve(question, chunks, index, k=4):
    q_emb = model.encode([question], convert_to_numpy=True)
    q_emb = q_emb / np.linalg.norm(q_emb, axis=1, keepdims=True)
    scores, indices = index.search(q_emb, k)
    results = []
    for score, idx in zip(scores[0], indices[0]):
        if idx < len(chunks):
            results.append({"text": chunks[idx], "score": float(score), "chunk_id": int(idx)})
    return results

def answer(question, sources):
    context = "\n\n".join([s["text"] for s in sources])
    response = client.messages.create(
        model="claude-sonnet-4-20250514",
        max_tokens=1024,
        messages=[{
            "role": "user",
            "content": CLINICAL_PROMPT.format(context=context, question=question)
        }]
    )
    return response.content[0].text