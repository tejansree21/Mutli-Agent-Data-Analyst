import { useState } from "react";
import axios from "axios";

function App() {
  const [file, setFile] = useState(null);
  const [question, setQuestion] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("profile");

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
    } catch (err) {
      setError("Something went wrong. Is the backend running?");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
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
          Running Profiler and Cleaner agents... this may take 30-60 seconds.
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

          <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
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

          <div
            style={{
              background: "#f5f5f5",
              padding: 16,
              borderRadius: 8,
              whiteSpace: "pre-wrap",
              maxHeight: 500,
              overflow: "auto",
            }}
          >
            {activeTab === "profile" && result.profile_report}
            {activeTab === "cleaning" && result.cleaning_report}
          </div>
        </div>
      )}
    </div>
  );
}

export default App;