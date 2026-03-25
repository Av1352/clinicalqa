import { useState } from "react"

export default function SourceViewer({ sources }) {
    const [open, setOpen] = useState(false)

    return (
        <div>
            <button
                onClick={() => setOpen(o => !o)}
                style={{
                    background: "none", border: "none", cursor: "pointer",
                    fontSize: "11px", color: "var(--text-dim)",
                    fontFamily: "'Space Mono', monospace",
                    padding: "0", letterSpacing: "0.04em", transition: "color 0.15s"
                }}
                onMouseEnter={e => e.currentTarget.style.color = "var(--green)"}
                onMouseLeave={e => e.currentTarget.style.color = "var(--text-dim)"}
            >
                {open ? "▾" : "▸"} {sources.length} source chunks
            </button>

            {open && (
                <div style={{ marginTop: "10px", display: "flex", flexDirection: "column", gap: "8px" }}>
                    {sources.map((s, i) => (
                        <div key={i} style={{
                            background: "#080c09", border: "1px solid var(--border)",
                            borderRadius: "8px", padding: "12px 14px",
                            borderLeft: `3px solid ${s.score > 0.7 ? "var(--green)" : s.score > 0.5 ? "#eab308" : "var(--border)"}`
                        }}>
                            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                                <span style={{
                                    fontSize: "10px", color: "var(--text-dim)",
                                    fontFamily: "'Space Mono', monospace"
                                }}>CHUNK_{String(s.chunk_id).padStart(3, "0")}</span>
                                <span style={{
                                    fontSize: "10px", fontFamily: "'Space Mono', monospace",
                                    color: s.score > 0.7 ? "var(--green)" : s.score > 0.5 ? "#eab308" : "var(--text-dim)"
                                }}>
                                    {(s.score * 100).toFixed(1)}%
                                </span>
                            </div>
                            <p style={{ fontSize: "12px", color: "var(--text-muted)", lineHeight: 1.7, margin: 0 }}>{s.text}</p>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}