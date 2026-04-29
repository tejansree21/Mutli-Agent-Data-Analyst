import os
from crewai import LLM

def get_llm():
    provider = os.getenv("LLM_PROVIDER", "ollama")

    if provider == "gemini":
        return LLM(
            model="gemini/gemini-2.0-flash",
            api_key=os.getenv("GEMINI_API_KEY")
        )
    else:
        return LLM(
            model="ollama/llama3.1:8b",
            base_url="http://localhost:11434"
        )