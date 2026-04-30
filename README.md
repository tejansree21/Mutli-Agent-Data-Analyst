# Multi-Agent AI Data Analyst

A multi-agent AI system that profiles, cleans, analyzes, and reports on any CSV dataset using natural language questions.

Upload a CSV, ask a question in plain English, and four specialized AI agents collaborate to deliver insights, visualizations, and a professional report — automatically.

## Demo

[Watch the demo video](link-to-your-video)

![App Screenshot](screenshot.png)

## How It Works

The system uses four AI agents orchestrated with CrewAI, each with a specific role:

| Agent | Role | What It Does |
|-------|------|-------------|
| Profiler | Data Quality Analyst | Examines dataset structure, types, missing values, distributions |
| Cleaner | Data Engineer | Handles missing values, fixes types, removes duplicates |
| Analyst | Senior Data Analyst | Writes and executes Python code to answer your question |
| Reporter | BI Report Writer | Summarizes findings into a professional markdown report |


## Features

- Upload any CSV and ask questions in natural language
- Automated data profiling and cleaning
- AI-generated Python code with real execution (not LLM guessing)
- Auto-generated charts and visualizations
- Professional summary reports with recommendations
- Tabbed UI showing every step of the pipeline
- Supports both local (Ollama) and cloud (Gemini) LLMs

## Tech Stack

- **Frontend:** React + Vite
- **Backend:** FastAPI (Python)
- **AI Orchestration:** CrewAI
- **LLM:** Ollama (Llama 3.1 8B) locally / Google Gemini for cloud
- **Data Processing:** pandas, matplotlib, scikit-learn
- **Deployment:** Vercel (frontend)

## Getting Started

### Prerequisites

- Python 3.11+
- Node.js 18+
- Ollama installed ([ollama.com](https://ollama.com))

### Setup

1. Clone the repo
```bash
git clone https://github.com/tejansree21/Mutli-Agent-Data-Analyst.git
cd Mutli-Agent-Data-Analyst
```

2. Backend setup
```bash
cd backend
python -m venv venv
venv\Scripts\activate  # Windows
pip install -r requirements.txt
```

3. Pull the Ollama model
```bash
ollama pull llama3.1:8b
```

4. Start the backend
```bash
python -m uvicorn app:app --reload
```

5. Frontend setup (new terminal)
```bash
cd frontend
npm install
npm run dev
```

6. Open http://localhost:5173 and upload a CSV

### Using Gemini (cloud) instead of Ollama

Create `backend/.env`:

Get a free API key at [aistudio.google.com](https://aistudio.google.com/apikey)

## Example Questions

- "Which product has the highest total revenue?"
- "Show me a bar chart of sales by region"
- "What is the correlation between price and units sold?"
- "Predict next month's revenue based on the trend"
- "Find any outliers in the dataset"

## Architecture
frontend/          → React + Vite UI
backend/
├── app.py         → FastAPI server
├── crew.py        → CrewAI pipeline orchestration
├── agents/
│   ├── profiler.py → Data Profiler Agent
│   ├── cleaner.py  → Data Cleaner Agent
│   ├── analyst.py  → Analyst Agent (code execution)
│   └── reporter.py → Report Writer Agent
├── llm/
│   └── provider.py → Ollama/Gemini switcher
└── tools/          → pandas/matplotlib helpers

## Limitations

- Code execution is sandboxed but not production-safe
- Gemini free tier: 15 requests/minute
- Large CSVs are sampled to first 10k rows
- Chart generation depends on LLM code quality

## Built By

**Tejan Sree** — [LinkedIn](your-linkedin) | [Portfolio](your-portfolio-url)

## License

MIT