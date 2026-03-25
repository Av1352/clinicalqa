import { useState } from "react"
const API = import.meta.env.VITE_API_URL

export default function DocumentUpload({ onUpload }) {
    const [status, setStatus] = useState("")
    const [docs, setDocs] = useState([])
    const [dragging, setDragging] = useState(false)
    const [loading, setLoading] = useState(false)

    async function processFile(file) {
        if (!file) return
        setLoading(true)
        setStatus("Indexing...")
        const fd = new FormData()
        fd.append("file", file)
        try {
            const res = await fetch(`${API}/upload`, { method: "POST", body: fd })
            const data = await res.json()
            setDocs(d => [...d, { name: data.document_id, chunks: data.chunk_count }])
            onUpload(data.document_id)
            setStatus(`${data.chunk_count} chunks indexed`)
        } catch {
            setStatus("Upload failed")
        }
        setLoading(false)
    }

    function handleFile(e) { processFile(e.target.files[0]) }

    function handleDrop(e) {
        e.preventDefault()
        setDragging(false)
        processFile(e.dataTransfer.files[0])
    }

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            <div style={{
                fontSize: "10px", color: "var(--green)",
                fontFamily: "'Space Mono', monospace", letterSpacing: "0.1em"
            }}>// DOCUMENT</div>

            <label
                onDragOver={e => { e.preventDefault(); setDragging(true) }}
                onDragLeave={() => setDragging(false)}
                onDrop={handleDrop}
                style={{
                    display: "flex", flexDirection: "column", alignItems: "center",
                    justifyContent: "center", gap: "10px",
                    padding: "28px 16px",
                    border: `1px dashed ${dragging ? "var(--green)" : "var(--border)"}`,
                    borderRadius: "10px", cursor: "pointer",
                    background: dragging ? "var(--bg-hover)" : "var(--bg-card)",
                    transition: "all 0.2s"
                }}
                onMouseEnter={e => e.currentTarget.style.borderColor = "var(--green-muted)"}
                onMouseLeave={e => { if (!dragging) e.currentTarget.style.borderColor = "var(--border)" }}
            >
                <div style={{ fontSize: "22px" }}>
                    {loading ? "⏳" : "📄"}
                </div>
                <div style={{ fontSize: "12px", color: "var(--text-muted)", textAlign: "center" }}>
                    {loading ? "Processing..." : "Drop PDF or TXT"}
                </div>
                <div style={{
                    fontSize: "10px", color: "var(--text-dim)",
                    fontFamily: "'Space Mono', monospace"
                }}>or click to browse</div>
                <input type="file" accept=".pdf,.txt" onChange={handleFile} style={{ display: "none" }} />
            </label>

            {status && (
                <div style={{
                    display: "flex", alignItems: "center", gap: "8px",
                    fontSize: "11px", color: "var(--green)",
                    fontFamily: "'Space Mono', monospace",
                    background: "var(--bg-card)", border: "1px solid var(--green-muted)",
                    borderRadius: "6px", padding: "8px 12px"
                }}>
                    <span style={{
                        width: "6px", height: "6px", borderRadius: "50%",
                        background: "var(--green)", boxShadow: "0 0 6px var(--green)",
                        display: "inline-block"
                    }} />
                    {status}
                </div>
            )}

            {docs.map((d, i) => (
                <div key={i} style={{
                    background: "var(--bg-card)", border: "1px solid var(--border)",
                    borderRadius: "8px", padding: "10px 12px"
                }}>
                    <div style={{
                        fontSize: "11px", color: "var(--text-muted)",
                        fontFamily: "'Space Mono', monospace",
                        whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis"
                    }}>{d.name}</div>
                    <div style={{ fontSize: "10px", color: "var(--text-dim)", marginTop: "3px" }}>
                        {d.chunks} chunks
                    </div>
                </div>
            ))}
        </div>
    )
}