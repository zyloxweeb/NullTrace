from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from app.analyzers.file_analyzer import analyze_file
from app.services.analysis_storage import (
    save_analysis,
    get_analysis,
    list_analyses,
    get_analysis_by_sha256,
)
from app.utils.hash_utils import calculate_sha256

app = FastAPI(title="NullTrace API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
def health():
    return {"status": "ok"}


@app.post("/analyze")
async def analyze(file: UploadFile = File(...)):
    content = await file.read()

    if not content:
        raise HTTPException(status_code=400, detail="Empty file")

    sha256 = calculate_sha256(content)

    existing_analysis = get_analysis_by_sha256(sha256)
    if existing_analysis:
        existing_analysis.setdefault("suspicious_patterns", [])
        existing_analysis.setdefault("strings", [])
        existing_analysis.setdefault("iocs", {
            "urls": [],
            "ips": [],
            "emails": [],
            "domains": [],
        })
        existing_analysis.setdefault("risk_assessment", {
            "score": 0,
            "severity": "low",
            "reasons": [],
        })

        return {
            **existing_analysis,
            "cached": True,
        }

    result = analyze_file(file.filename, content)
    saved_result = save_analysis(result)

    return {
        **saved_result,
        "cached": False,
    }


@app.get("/analyses")
def get_all_analyses():
    return list_analyses()


@app.get("/analyses/{analysis_id}")
def get_single_analysis(analysis_id: str):
    analysis = get_analysis(analysis_id)

    if not analysis:
        raise HTTPException(status_code=404, detail="Analysis not found")

    return analysis