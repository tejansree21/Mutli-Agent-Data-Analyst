import { useState } from "react";
import axios from "axios";

function App() {
  const [file, setFile] = useState(null);
  const [question, setQuestion] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("report");
  const [agentStatus, setAgentStatus] = useState("");

  const handleSubmit = async () => {
    if (!file || !question.trim()) {
      setError("Please upload a CSV and enter a question.");
      return;
    }

    setLoading(true);
    setError("");
    setResult(null);

    const stages = [
      "Profiler Agent analyzing dataset structure...",
      "Cleaner Agent preparing data...",
      "Analyst Agent writing & executing code...",
      "Reporter Agent writing summary..."
    ];
    let stageIndex = 0;
    setAgentStatus(stages[0]);
    const interval = setInterval(() => {
      stageIndex++;
      if (stageIndex < stages.length) {
        setAgentStatus(stages[stageIndex]);
      }
    }, 15000);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("question", question);

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL || "http://127.0.0.1:8000"}/analyze`,
        formData,
        { timeout: 300000 }
      );
      setResult(response.data);
      setActiveTab("report");
    } catch (err) {
      setError("Something went wrong. Is the backend running?");
      console.error(err);
    } finally {
      clearInterval(interval);
      setAgentStatus("");
      setLoading(false);
    }
  };

  const tabs = [
    { id: "report", label: "Summary Report" },
    { id: "analysis", label: "Raw Output" },
    { id: "code", label: "Generated Code" },
    { id: "profile", label: "Data Profile" },
    { id: "cleaning", label: "Cleaning Report" },
  ];

  return (
    <div style={{
      maxWidth: 900,
      margin: "0 auto",
      padding: "40px 20px",
      fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      color: "#1a1a1a",
      backgroundColor: "#ffffff",
      minHeight: "100vh"
    }}>
      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
          <div style={{
            width: 40, height: 40, borderRadius: 10,
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            display: "flex", alignItems: "center", justifyContent: "center",
            color: "#fff", fontWeight: "bold", fontSize: 18
          }}>AI</div>
          <h1 style={{ margin: 0, fontSize: 28, fontWeight: 700, color: "#1a1a1a" }}>Data Analyst</h1>
        </div>
        <p style={{ color: "#666", margin: 0, fontSize: 15 }}>
          Multi-agent AI system that profiles, cleans, analyzes, and reports on your data.
        </p>
      </div>

      {/* Upload Section */}
      <div style={{
        background: "#f8f9fa",
        border: "2px dashed #dee2e6",
        borderRadius: 12,
        padding: 24,
        marginBottom: 20
      }}>
        <div style={{ marginBottom: 16 }}>
          <label style={{ display: "block", marginBottom: 6, fontWeight: 600, fontSize: 14, color: "#1a1a1a" }}>
            Upload CSV
          </label>
          <input
            type="file"
            accept=".csv"
            onChange={(e) => setFile(e.target.files[0])}
            style={{ fontSize: 14 }}
          />
          {file && (
            <span style={{ marginLeft: 12, color: "#28a745", fontSize: 13 }}>
              ✓ {file.name}
            </span>
          )}
        </div>

        <div style={{ marginBottom: 16 }}>
          <label style={{ display: "block", marginBottom: 6, fontWeight: 600, fontSize: 14, color: "#1a1a1a" }}>
            Ask a question
          </label>
          <textarea
            placeholder="e.g. Which product generates the most revenue? Show me a breakdown by region."
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            rows={3}
            style={{
              width: "100%",
              padding: 12,
              fontSize: 14,
              borderRadius: 8,
              border: "1px solid #dee2e6",
              resize: "vertical",
              boxSizing: "border-box",
              color: "#1a1a1a",
              backgroundColor: "#ffffff"
            }}
          />
        </div>

        <button
          onClick={handleSubmit}
          disabled={loading}
          style={{
            padding: "12px 32px",
            fontSize: 15,
            fontWeight: 600,
            color: "#fff",
            background: loading
              ? "#999"
              : "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            border: "none",
            borderRadius: 8,
            cursor: loading ? "not-allowed" : "pointer",
          }}
        >
          {loading ? "Agents Working..." : "Analyze"}
        </button>
      </div>

      {/* Loading */}
      {loading && (
        <div style={{
          background: "#f0f0ff",
          border: "1px solid #d0d0ff",
          borderRadius: 8,
          padding: 16,
          marginBottom: 20,
          display: "flex",
          alignItems: "center",
          gap: 12
        }}>
          <div style={{
            width: 20, height: 20,
            border: "3px solid #ddd",
            borderTop: "3px solid #667eea",
            borderRadius: "50%",
            animation: "spin 1s linear infinite"
          }} />
          <span style={{ color: "#444", fontSize: 14 }}>{agentStatus}</span>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      )}

      {/* Error */}
      {error && (
        <div style={{
          background: "#fff5f5",
          border: "1px solid #fcc",
          borderRadius: 8,
          padding: 12,
          marginBottom: 20,
          color: "#c00",
          fontSize: 14
        }}>
          {error}
        </div>
      )}

      {/* Results */}
      {result && (
        <div>
          {/* Dataset badge */}
          <div style={{
            display: "inline-flex",
            gap: 16,
            background: "#e8f5e9",
            padding: "8px 16px",
            borderRadius: 6,
            fontSize: 13,
            marginBottom: 16,
            color: "#1a1a1a"
          }}>
            <span><strong>{result.rows}</strong> rows</span>
            <span><strong>{result.columns}</strong> columns</span>
            <span style={{ color: "#666" }}>{result.column_names.join(", ")}</span>
          </div>

          {/* Tabs */}
          <div style={{
            display: "flex",
            gap: 4,
            marginBottom: 0,
            borderBottom: "2px solid #eee",
            flexWrap: "wrap"
          }}>
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  padding: "10px 18px",
                  background: "none",
                  color: activeTab === tab.id ? "#667eea" : "#888",
                  border: "none",
                  borderBottom: activeTab === tab.id ? "2px solid #667eea" : "2px solid transparent",
                  cursor: "pointer",
                  fontWeight: activeTab === tab.id ? 600 : 400,
                  fontSize: 14,
                  marginBottom: -2
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab content */}
          <div style={{
            padding: 20,
            border: "1px solid #eee",
            borderTop: "none",
            borderRadius: "0 0 8px 8px",
            minHeight: 200,
            backgroundColor: "#ffffff"
          }}>
            {activeTab === "report" && (
              <div style={{ whiteSpace: "pre-wrap", lineHeight: 1.7, fontSize: 14, color: "#1a1a1a" }}>
                {result.summary_report}

                {result.charts && result.charts.map((chart, i) => (
                  <img
                    key={i}
                    src={`data:image/png;base64,${chart}`}
                    alt={`Chart ${i + 1}`}
                    style={{
                      maxWidth: "100%",
                      borderRadius: 8,
                      marginTop: 16,
                      border: "1px solid #eee"
                    }}
                  />
                ))}
              </div>
            )}

            {activeTab === "analysis" && (
              <div>
                {result.code_error && (
                  <div style={{
                    background: "#fff5f5",
                    padding: 12,
                    borderRadius: 8,
                    marginBottom: 12,
                    color: "#c00",
                    fontSize: 13
                  }}>
                    Error: {result.code_error}
                  </div>
                )}
                <pre style={{
                  background: "#f8f9fa",
                  padding: 16,
                  borderRadius: 8,
                  fontSize: 13,
                  overflow: "auto",
                  maxHeight: 400,
                  color: "#1a1a1a"
                }}>
                  {result.analysis_output || "No output generated."}
                </pre>
              </div>
            )}

            {activeTab === "code" && (
              <pre style={{
                background: "#1e1e1e",
                color: "#d4d4d4",
                padding: 16,
                borderRadius: 8,
                fontSize: 13,
                overflow: "auto",
                maxHeight: 500
              }}>
                {result.code || "No code generated."}
              </pre>
            )}

            {activeTab === "profile" && (
              <div style={{
                whiteSpace: "pre-wrap",
                fontSize: 14,
                lineHeight: 1.6,
                maxHeight: 500,
                overflow: "auto",
                color: "#1a1a1a"
              }}>
                {result.profile_report}
              </div>
            )}

            {activeTab === "cleaning" && (
              <div style={{
                whiteSpace: "pre-wrap",
                fontSize: 14,
                lineHeight: 1.6,
                maxHeight: 500,
                overflow: "auto",
                color: "#1a1a1a"
              }}>
                {result.cleaning_report}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Footer */}
      <div style={{
        marginTop: 40,
        paddingTop: 20,
        borderTop: "1px solid #eee",
        color: "#999",
        fontSize: 12,
        textAlign: "center"
      }}>
        Powered by CrewAI + Ollama (Llama 3.1 8B) • Built by Tejan
      </div>
    </div>
  );
}

export default App;