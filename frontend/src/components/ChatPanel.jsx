import { useState, useRef, useEffect } from "react"
import SourceViewer from "./SourceViewer"
const API = import.meta.env.VITE_API_URL

const SUGGESTIONS = [
    "What medications were prescribed?",
    "What was the primary diagnosis?",
    "What procedures were performed?",
    "What are the follow-up instructions?"
]

export default function ChatPanel({ docId }) {
    const [q, setQ] = useState("")
    const [messages, setMessages] = useState([])
    const [loading, setLoading] = useState(false)
    const bottomRef = useRef(null)

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" })
    }, [messages])

    async function ask(question) {
        const text = question || q
        if (!docId || !text.trim()) return
        setLoading(true)
        setQ("")
        setMessages(m => [...m, { question: text, answer: null, sources: [] }])
        const res = await fetch(`${API}/ask`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ document_id: docId, question: text })
        })
        const data = await res.json()
        setMessages(m => m.map((msg, i) =>
            i === m.length - 1 ? { ...msg, answer: data.answer, sources: data.sources } : msg
        ))
        setLoading(false)
    }

    return (
        <div style={{ display: "flex", flexDirection: "column", height: "100%", gap: "20px" }}>

            {messages.length === 0 && (
                <div style={{
                    flex: 1, display: "flex", flexDirection: "column",
                    alignItems: "center", justifyContent: "center", gap: "24px"
                }}>
                    <div>
                        <div style={{
                            fontSize: "10px", color: "var(--green)",
                            fontFamily: "'Space Mono', monospace", letterSpacing: "0.1em",
                            textAlign: "center", marginBottom: "8px"
                        }}>// CLINICAL QA ENGINE</div>
                        <div style={{
                            fontSize: "24px", fontWeight: "600", color: "var(--text)",
                            textAlign: "center", letterSpacing: "-0.03em"
                        }}>
                            {docId ? "Ready for questions" : "Upload a document"}
                        </div>
                        <div style={{ fontSize: "13px", color: "var(--text-muted)", textAlign: "center", marginTop: "8px" }}>
                            {docId
                                ? "Answers grounded strictly in document context"
                                : "Supports PDF and TXT clinical documents"}
                        </div>
                    </div>

                    {docId && (
                        <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", justifyContent: "center", maxWidth: "500px" }}>
                            {SUGGESTIONS.map(s => (
                                <button key={s} onClick={() => ask(s)}
                                    style={{
                                        fontSize: "12px", color: "var(--text-muted)",
                                        background: "var(--bg-card)",
                                        border: "1px solid var(--border)",
                                        borderRadius: "20px", padding: "7px 16px",
                                        cursor: "pointer", transition: "all 0.15s",
                                        fontFamily: "'Space Grotesk', sans-serif"
                                    }}
                                    onMouseEnter={e => {
                                        e.currentTarget.style.borderColor = "var(--green)"
                                        e.currentTarget.style.color = "var(--green)"
                                    }}
                                    onMouseLeave={e => {
                                        e.currentTarget.style.borderColor = "var(--border)"
                                        e.currentTarget.style.color = "var(--text-muted)"
                                    }}
                                >
                                    {s}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {messages.length > 0 && (
                <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: "24px", paddingRight: "4px" }}>
                    {messages.map((m, i) => (
                        <div key={i} style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                            {/* Question bubble */}
                            <div style={{ display: "flex", justifyContent: "flex-end" }}>
                                <div style={{
                                    background: "var(--bg-hover)",
                                    border: "1px solid var(--green-muted)",
                                    borderRadius: "12px 12px 4px 12px",
                                    padding: "12px 16px", maxWidth: "65%",
                                    fontSize: "14px", color: "var(--text)", lineHeight: 1.6
                                }}>
                                    {m.question}
                                </div>
                            </div>

                            {/* Answer */}
                            <div style={{ display: "flex", gap: "12px", alignItems: "flex-start" }}>
                                <div style={{
                                    width: "24px", height: "24px", borderRadius: "6px",
                                    background: "var(--green)", display: "flex", alignItems: "center",
                                    justifyContent: "center", fontSize: "11px", color: "#000",
                                    fontWeight: "700", flexShrink: 0, marginTop: "2px"
                                }}>✚</div>
                                <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "8px" }}>
                                    <div style={{
                                        background: "var(--bg-card)", border: "1px solid var(--border)",
                                        borderRadius: "4px 12px 12px 12px",
                                        padding: "14px 18px",
                                        fontSize: "14px", color: "var(--text)", lineHeight: 1.8
                                    }}>
                                        {m.answer ? (
                                            <span dangerouslySetInnerHTML={{
                                                __html: m.answer
                                                    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
                                                    .replace(/\n/g, "<br/>")
                                            }} />
                                        ) : (
                                            <span style={{
                                                color: "var(--text-dim)", fontFamily: "'Space Mono', monospace",
                                                fontSize: "12px"
                                            }}>retrieving context_</span>
                                        )}
                                    </div>
                                    {m.sources?.length > 0 && <SourceViewer sources={m.sources} />}
                                </div>
                            </div>
                        </div>
                    ))}
                    <div ref={bottomRef} />
                </div>
            )}

            {/* Input bar */}
            <div style={{
                display: "flex", gap: "10px",
                background: "var(--bg-card)", border: "1px solid var(--border)",
                borderRadius: "12px", padding: "8px 8px 8px 16px",
                transition: "border-color 0.2s"
            }}
                onFocusCapture={e => e.currentTarget.style.borderColor = "var(--green-muted)"}
                onBlurCapture={e => e.currentTarget.style.borderColor = "var(--border)"}
            >
                <input
                    value={q}
                    onChange={e => setQ(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && ask()}
                    placeholder={docId ? "Ask a clinical question..." : "Upload a document first"}
                    disabled={!docId || loading}
                    style={{
                        flex: 1, background: "transparent", border: "none", outline: "none",
                        fontSize: "14px", color: "var(--text)",
                        fontFamily: "'Space Grotesk', sans-serif"
                    }}
                />
                <button
                    onClick={() => ask()}
                    disabled={!docId || loading || !q.trim()}
                    style={{
                        background: (!docId || !q.trim()) ? "var(--bg-hover)" : "var(--green)",
                        border: "none", borderRadius: "8px",
                        padding: "10px 20px", cursor: "pointer",
                        fontSize: "13px", fontWeight: "600",
                        color: (!docId || !q.trim()) ? "var(--text-dim)" : "#000",
                        transition: "all 0.2s",
                        fontFamily: "'Space Grotesk', sans-serif"
                    }}
                >
                    {loading ? "..." : "Ask →"}
                </button>
            </div>
        </div>
    )
}