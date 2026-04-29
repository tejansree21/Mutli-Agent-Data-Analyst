from crewai import Agent, Task
import pandas as pd

def get_cleaner_agent(llm):
    return Agent(
        role="Data Cleaner",
        goal="Clean and prepare the dataset based on the profiler's recommendations.",
        backstory="You are a data engineer who specializes in data cleaning and preparation. You handle missing values, fix data types, remove duplicates, and ensure data quality.",
        llm=llm,
        verbose=True,
        allow_delegation=False
    )

def get_cleaner_task(agent, df: pd.DataFrame, profile_report: str):
    # Do the actual cleaning in Python, ask LLM to summarize what was done
    cleaning_log = []

    # Remove duplicates
    before = len(df)
    df = df.drop_duplicates()
    after = len(df)
    if before != after:
        cleaning_log.append(f"Removed {before - after} duplicate rows")

    # Handle missing values
    for col in df.columns:
        missing = df[col].isnull().sum()
        if missing > 0:
            if df[col].dtype in ["int64", "float64"]:
                median_val = df[col].median()
                df[col] = df[col].fillna(median_val)
                cleaning_log.append(f"Filled {missing} missing values in '{col}' with median ({median_val})")
            else:
                mode_val = df[col].mode()[0] if not df[col].mode().empty else "Unknown"
                df[col] = df[col].fillna(mode_val)
                cleaning_log.append(f"Filled {missing} missing values in '{col}' with mode ('{mode_val}')")

    # Convert numeric columns that are stored as strings
    for col in df.columns:
        if df[col].dtype == "object":
            try:
                df[col] = pd.to_numeric(df[col])
                cleaning_log.append(f"Converted '{col}' from string to numeric")
            except (ValueError, TypeError):
                pass

    if not cleaning_log:
        cleaning_log.append("Dataset was already clean — no changes needed")

    cleaning_summary = "\n".join(cleaning_log)

    return Task(
        description=f"""The dataset has been cleaned. Here is what was done:

{cleaning_summary}

Original profiler report:
{profile_report}

Write a brief cleaning report summarizing:
1. What cleaning steps were performed
2. How many rows/values were affected
3. The dataset is now ready for analysis

Be concise.""",
        expected_output="A brief markdown cleaning report summarizing the steps taken and confirming the data is ready for analysis.",
        agent=agent
    ), df, cleaning_summary