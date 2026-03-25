import { useState } from "react"
import DocumentUpload from "./components/DocumentUpload"
import ChatPanel from "./components/ChatPanel"

export default function App() {
    const [docId, setDocId] = useState(null)

    return (
        <div style={{ minHeight: "100vh", background: "var(--bg)", display: "flex", flexDirection: "column" }}>

            {/* Header */}
            <header style={{
                borderBottom: "1px solid var(--border)",
                padding: "0 40px",
                display: "flex", alignItems: "center", justifyContent: "space-between",
                height: "60px", background: "var(--bg)",
                position: "sticky", top: 0, zIndex: 10
            }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <div style={{
                        width: "28px", height: "28px", borderRadius: "6px",
                        background: "var(--green)", display: "flex", alignItems: "center",
                        justifyContent: "center", fontSize: "14px", color: "#000", fontWeight: "700"
                    }}>✚</div>
                    <span style={{ fontSize: "15px", fontWeight: "600", letterSpacing: "-0.02em", color: "var(--text)" }}>
                        ClinicalQA
                    </span>
                    <span style={{
                        fontSize: "10px", color: "var(--text-dim)", fontFamily: "'Space Mono', monospace",
                        letterSpacing: "0.1em", textTransform: "uppercase",
                        marginLeft: "4px", paddingTop: "2px"
                    }}>
                        / RAG
                    </span>
                </div>

                <div style={{
                    display: "flex", alignItems: "center", gap: "8px",
                    fontSize: "11px", fontFamily: "'Space Mono', monospace",
                    color: docId ? "var(--green)" : "var(--text-dim)",
                    background: "var(--bg-card)", border: "1px solid var(--border)",
                    borderRadius: "6px", padding: "5px 12px"
                }}>
                    <span style={{
                        width: "6px", height: "6px", borderRadius: "50%",
                        background: docId ? "var(--green)" : "var(--text-dim)",
                        display: "inline-block",
                        boxShadow: docId ? "0 0 8px var(--green)" : "none"
                    }} />
                    {docId ? docId : "no document"}
                </div>
            </header>

            {/* Layout */}
            <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>

                {/* Sidebar */}
                <aside style={{
                    width: "280px", minWidth: "280px",
                    borderRight: "1px solid var(--border)",
                    padding: "28px 20px",
                    display: "flex", flexDirection: "column", gap: "20px",
                    background: "var(--bg)"
                }}>
                    <DocumentUpload onUpload={setDocId} />

                    <div style={{ marginTop: "auto" }}>
                        <div style={{
                            background: "var(--bg-card)", border: "1px solid var(--border)",
                            borderRadius: "10px", padding: "16px", borderLeft: "3px solid var(--green-muted)"
                        }}>
                            <div style={{
                                fontSize: "10px", color: "var(--green)", fontFamily: "'Space Mono', monospace",
                                letterSpacing: "0.1em", marginBottom: "10px"
                            }}>// HOW IT WORKS</div>
                            {[
                                "Chunks document with overlap",
                                "Embeds locally via sentence-transformers",
                                "Retrieves via FAISS cosine similarity",
                                "Claude answers from context only"
                            ].map((t, i) => (
                                <div key={i} style={{ display: "flex", gap: "10px", marginBottom: "8px", alignItems: "flex-start" }}>
                                    <span style={{ color: "var(--green)", fontSize: "11px", fontFamily: "'Space Mono', monospace", minWidth: "16px" }}>
                                        {String(i + 1).padStart(2, "0")}
                                    </span>
                                    <span style={{ fontSize: "12px", color: "var(--text-muted)", lineHeight: 1.5 }}>{t}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </aside>

                {/* Main */}
                <main style={{
                    flex: 1, padding: "32px 40px",
                    display: "flex", flexDirection: "column", overflow: "hidden"
                }}>
                    <ChatPanel docId={docId} />
                </main>
            </div>
        </div>
    )
}