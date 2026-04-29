from crewai import Agent, Task
import pandas as pd

def get_profiler_agent(llm):
    return Agent(
        role="Data Profiler",
        goal="Analyze the structure and quality of the dataset and produce a detailed profile report.",
        backstory="You are an expert data analyst who specializes in understanding datasets. You examine data types, missing values, distributions, and potential quality issues.",
        llm=llm,
        verbose=True,
        allow_delegation=False
    )

def get_profiler_task(agent, df: pd.DataFrame):
    # Build the profile ourselves — don't make the LLM guess
    profile = {
        "shape": f"{df.shape[0]} rows × {df.shape[1]} columns",
        "columns": {},
        "missing_values": df.isnull().sum().to_dict(),
        "duplicated_rows": int(df.duplicated().sum()),
    }

    for col in df.columns:
        col_info = {
            "dtype": str(df[col].dtype),
            "unique_values": int(df[col].nunique()),
            "sample_values": df[col].head(3).tolist()
        }
        if df[col].dtype in ["int64", "float64"]:
            col_info["min"] = float(df[col].min())
            col_info["max"] = float(df[col].max())
            col_info["mean"] = float(df[col].mean())
        profile["columns"][col] = col_info

    profile_str = str(profile)

    return Task(
        description=f"""Review this dataset profile and provide a summary report:

{profile_str}

Your report should include:
1. Overview of the dataset (size, structure)
2. Data quality issues (missing values, duplicates, type mismatches)
3. Key observations about each column
4. Recommendations for data cleaning

Return a clear, structured markdown report.""",
        expected_output="A markdown data profile report with overview, quality issues, column analysis, and cleaning recommendations.",
        agent=agent
    )