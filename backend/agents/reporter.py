from crewai import Agent, Task

def get_reporter_agent(llm):
    return Agent(
        role="Report Writer",
        goal="Write a clear, professional summary report of the data analysis results.",
        backstory="You are a business intelligence analyst who excels at turning raw data outputs into clear, actionable insights. You write concise reports that non-technical stakeholders can understand.",
        llm=llm,
        verbose=True,
        allow_delegation=False
    )

def get_reporter_task(agent, question: str, analysis_output: str, code: str, profile_report: str, cleaning_report: str, has_charts: bool):
    return Task(
        description=f"""Write a professional summary report based on the following analysis.

User's Question: "{question}"

Analysis Output:
{analysis_output}

Code Used:
{code}

Data Profile Summary:
{profile_report[:500]}

Cleaning Summary:
{cleaning_report[:300]}

Write a report with these sections:
1. **Question** — Restate what was asked
2. **Key Findings** — The direct answer with specific numbers. Be precise.
3. **Methodology** — Briefly explain how the analysis was done (1-2 sentences)
4. **Data Quality Notes** — Any relevant notes from profiling/cleaning
5. **Recommendations** — 2-3 actionable next steps based on the findings

{"6. **Visualizations** — Note that charts have been generated to illustrate the findings." if has_charts else ""}

Keep it concise — no longer than 300 words. Use markdown formatting.
Do NOT include any code in the report.""",
        expected_output="A concise markdown report with Key Findings, Methodology, Data Quality Notes, and Recommendations.",
        agent=agent
    )