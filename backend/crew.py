from crewai import Crew, LLM
from agents.profiler import get_profiler_agent, get_profiler_task
from agents.cleaner import get_cleaner_agent, get_cleaner_task
from agents.analyst import get_analyst_agent, get_analyst_task, parse_code_from_response, execute_code
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

    # Step 3: Analyze
    analyst_agent = get_analyst_agent(llm)
    analyst_task = get_analyst_task(
        analyst_agent, cleaned_df, question, cleaning_report
    )

    analyst_crew = Crew(
        agents=[analyst_agent],
        tasks=[analyst_task],
        verbose=True
    )
    analyst_result = analyst_crew.kickoff()

    # Parse and execute the generated code
    code = parse_code_from_response(str(analyst_result))
    execution_result = execute_code(code, cleaned_df)

    # If code failed, try once more with the error message
    if not execution_result["success"]:
        retry_task = get_analyst_task(
            analyst_agent, cleaned_df,
            f"{question}\n\nPrevious code failed with error: {execution_result['error']}\nFix the code.",
            cleaning_report
        )
        retry_crew = Crew(
            agents=[analyst_agent],
            tasks=[retry_task],
            verbose=True
        )
        retry_result = retry_crew.kickoff()
        code = parse_code_from_response(str(retry_result))
        execution_result = execute_code(code, cleaned_df)

    return {
        "profile_report": profile_report,
        "cleaning_report": cleaning_report,
        "cleaning_log": cleaning_log,
        "cleaned_df": cleaned_df,
        "question": question,
        "code": code,
        "analysis_output": execution_result["output"],
        "charts": execution_result["charts"],
        "code_error": execution_result["error"]
    }