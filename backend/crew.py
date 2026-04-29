from crewai import Crew, LLM
from agents.profiler import get_profiler_agent, get_profiler_task
from agents.cleaner import get_cleaner_agent, get_cleaner_task
import pandas as pd

def get_llm():
    return LLM(
        model="ollama/llama3.1:8b",
        base_url="http://localhost:11434"
    )

def run_pipeline(df: pd.DataFrame, question: str):
    llm = get_llm()

    # Step 1: Profile
    profiler_agent = get_profiler_agent(llm)
    profiler_task = get_profiler_task(profiler_agent, df)

    profile_crew = Crew(
        agents=[profiler_agent],
        tasks=[profiler_task],
        verbose=True
    )
    profile_result = profile_crew.kickoff()
    profile_report = str(profile_result)

    # Step 2: Clean
    cleaner_agent = get_cleaner_agent(llm)
    cleaner_task, cleaned_df, cleaning_log = get_cleaner_task(
        cleaner_agent, df.copy(), profile_report
    )

    cleaner_crew = Crew(
        agents=[cleaner_agent],
        tasks=[cleaner_task],
        verbose=True
    )
    cleaner_result = cleaner_crew.kickoff()
    cleaning_report = str(cleaner_result)

    return {
        "profile_report": profile_report,
        "cleaning_report": cleaning_report,
        "cleaning_log": cleaning_log,
        "cleaned_df": cleaned_df,
        "question": question
    }