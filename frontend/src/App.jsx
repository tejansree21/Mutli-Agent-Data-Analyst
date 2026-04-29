import { useState } from "react";
import axios from "axios";

function App() {
  const [file, setFile] = useState(null);
  const [question, setQuestion] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("analysis");

  const handleSubmit = async () => {
    if (!file || !question.trim()) {
      setError("Please upload a CSV and enter a question.");
      return;
    }

    setLoading(true);
    setError("");
    setResult(null);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("question", question);

    try {
      const response = await axios.post(
        "http://127.0.0.1:8000/analyze",
        formData
      );
      setResult(response.data);
      setActiveTab("analysis");
    } catch (err) {
      setError("Something went wrong. Is the backend running?");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: "analysis", label: "Analysis" },
    { id: "code", label: "Code" },
    { id: "profile", label: "Data Profile" },
    { id: "cleaning", label: "Cleaning Report" },
  ];

  return (
    <div style={{ maxWidth: 800, margin: "40px auto", padding: 20, fontFamily: "sans-serif" }}>
      <h1>AI Data Analyst</h1>
      <p style={{ color: "#666" }}>Upload a CSV file and ask any question about your data.</p>

      <div style={{ marginBottom: 16 }}>
        <input
          type="file"
          accept=".csv"
          onChange={(e) => setFile(e.target.files[0])}
        />
      </div>

      <div style={{ marginBottom: 16 }}>
        <textarea
          placeholder="e.g. What are the top 5 products by revenue?"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          rows={3}
          style={{ width: "100%", padding: 8, fontSize: 14 }}
        />
      </div>

      <button
        onClick={handleSubmit}
        disabled={loading}
        style={{
          padding: "10px 24px",
          fontSize: 14,
          cursor: loading ? "not-allowed" : "pointer",
        }}
      >
        {loading ? "Agents working..." : "Analyze"}
      </button>

      {error && <div style={{ marginTop: 16, color: "red" }}>{error}</div>}

      {loading && (
        <div style={{ marginTop: 16, color: "#888" }}>
          Running Profiler → Cleaner → Analyst agents... this may take 1-2 minutes.
        </div>
      )}

      {result && (
        <div style={{ marginTop: 24 }}>
          <div style={{ marginBottom: 8 }}>
            <strong>{result.rows} rows × {result.columns} columns</strong>
            <span style={{ marginLeft: 12, color: "#666" }}>
              Columns: {result.column_names.join(", ")}
            </span>
          </div>

          <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  padding: "8px 16px",
                  background: activeTab === tab.id ? "#333" : "#eee",
                  color: activeTab === tab.id ? "#fff" : "#333",
                  border: "none",
                  borderRadius: 4,
                  cursor: "pointer",
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {activeTab === "analysis" && (
            <div>
              {result.code_error && (
                <div style={{
                  background: "#fee",
                  padding: 12,
                  borderRadius: 8,
                  marginBottom: 12,
                  color: "#c00"
                }}>
                  Code execution error: {result.code_error}
                </div>
              )}

              {result.analysis_output && (
                <div style={{
                  background: "#f5f5f5",
                  padding: 16,
                  borderRadius: 8,
                  whiteSpace: "pre-wrap",
                  fontFamily: "monospace",
                  marginBottom: 16
                }}>
                  {result.analysis_output}
                </div>
              )}

              {result.charts && result.charts.map((chart, i) => (
                <img
                  key={i}
                  src={`data:image/png;base64,${chart}`}
                  alt={`Chart ${i + 1}`}
                  style={{
                    maxWidth: "100%",
                    borderRadius: 8,
                    marginBottom: 12,
                    border: "1px solid #ddd"
                  }}
                />
              ))}

              {!result.analysis_output && !result.charts?.length && !result.code_error && (
                <div style={{ color: "#888", padding: 16 }}>
                  No output generated. Try rephrasing your question.
                </div>
              )}
            </div>
          )}

          {activeTab === "code" && (
            <div style={{
              background: "#1e1e1e",
              color: "#d4d4d4",
              padding: 16,
              borderRadius: 8,
              whiteSpace: "pre-wrap",
              fontFamily: "monospace",
              fontSize: 13,
              overflow: "auto",
              maxHeight: 500
            }}>
              {result.code || "No code generated."}
            </div>
          )}

          {activeTab === "profile" && (
            <div style={{
              background: "#f5f5f5",
              padding: 16,
              borderRadius: 8,
              whiteSpace: "pre-wrap",
              maxHeight: 500,
              overflow: "auto"
            }}>
              {result.profile_report}
            </div>
          )}

          {activeTab === "cleaning" && (
            <div style={{
              background: "#f5f5f5",
              padding: 16,
              borderRadius: 8,
              whiteSpace: "pre-wrap",
              maxHeight: 500,
              overflow: "auto"
            }}>
              {result.cleaning_report}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default App;