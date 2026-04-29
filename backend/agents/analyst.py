from crewai import Agent, Task
import pandas as pd
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import io
import base64
import sys
from contextlib import redirect_stdout

def get_analyst_agent(llm):
    return Agent(
        role="Data Analyst",
        goal="Answer the user's question by writing and executing Python pandas code on the dataset.",
        backstory="You are a senior data analyst who writes precise Python code to answer data questions. You use pandas for analysis and matplotlib for visualizations. You always print your results.",
        llm=llm,
        verbose=True,
        allow_delegation=False
    )

def execute_code(code: str, df: pd.DataFrame):
    """Safely execute pandas code and capture output + any charts."""
    output_buffer = io.StringIO()
    charts = []

    # Make df available to the executed code
    local_vars = {"df": df, "pd": pd, "plt": plt}

    try:
        with redirect_stdout(output_buffer):
            exec(code, {"__builtins__": __builtins__}, local_vars)

        # Check if any matplotlib figures were created
        fig_nums = plt.get_fignums()
        for fig_num in fig_nums:
            fig = plt.figure(fig_num)
            img_buffer = io.BytesIO()
            fig.savefig(img_buffer, format='png', bbox_inches='tight', dpi=100)
            img_buffer.seek(0)
            img_base64 = base64.b64encode(img_buffer.read()).decode('utf-8')
            charts.append(img_base64)
            plt.close(fig)

        return {
            "success": True,
            "output": output_buffer.getvalue(),
            "charts": charts,
            "error": None
        }
    except Exception as e:
        return {
            "success": False,
            "output": output_buffer.getvalue(),
            "charts": [],
            "error": str(e)
        }

def get_analyst_task(agent, df: pd.DataFrame, question: str, cleaning_report: str):
    columns_info = []
    for col in df.columns:
        dtype = str(df[col].dtype)
        sample = df[col].head(3).tolist()
        columns_info.append(f"  - {col} ({dtype}): sample values {sample}")
    columns_str = "\n".join(columns_info)

    return Task(
        description=f"""You have a pandas DataFrame called `df` with {df.shape[0]} rows and {df.shape[1]} columns:

{columns_str}

The user's question is: "{question}"

Previous cleaning report:
{cleaning_report}

Write Python code to answer this question. Rules:
1. The DataFrame is already loaded as `df` — do NOT read from any file
2. Use pandas for analysis
3. Use matplotlib (plt) for any charts — call plt.figure() before plotting
4. PRINT all results using print() — this is how the output gets captured
5. Be precise — compute exact numbers, don't estimate
6. If the question asks for a visualization, create one with clear labels and title

Return ONLY the Python code block, nothing else. No explanation before or after.
Wrap your code in ```python and ``` markers.""",
        expected_output="A Python code block that answers the user's question using the df DataFrame.",
        agent=agent
    )

def parse_code_from_response(response: str) -> str:
    """Extract Python code from the agent's response."""
    code = str(response)

    # Try to extract from ```python ... ``` blocks
    if "```python" in code:
        parts = code.split("```python")
        if len(parts) > 1:
            code = parts[1].split("```")[0]
    elif "```" in code:
        parts = code.split("```")
        if len(parts) > 1:
            code = parts[1].split("```")[0]

    # Clean up
    code = code.strip()

    # Remove any lines that try to read files
    lines = code.split("\n")
    filtered = [l for l in lines if "read_csv" not in l and "read_excel" not in l]
    code = "\n".join(filtered)

    return code