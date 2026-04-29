from fastapi import FastAPI, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
import pandas as pd
import io
from crew import run_pipeline

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/analyze")
async def analyze(file: UploadFile = File(...), question: str = Form(...)):
    contents = await file.read()
    df = pd.read_csv(io.BytesIO(contents))

    result = run_pipeline(df, question)

    return {
        "profile_report": result["profile_report"],
        "cleaning_report": result["cleaning_report"],
        "cleaning_log": result["cleaning_log"],
        "rows": result["cleaned_df"].shape[0],
        "columns": result["cleaned_df"].shape[1],
        "column_names": result["cleaned_df"].columns.tolist(),
        "question": result["question"],
        "code": result["code"],
        "analysis_output": result["analysis_output"],
        "charts": result["charts"],
        "code_error": result["code_error"]
    }