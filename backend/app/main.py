import os
from fastapi import FastAPI, UploadFile, File, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

from app.analyzers.file_analyzer import analyze_file
from app.services.analysis_storage import (
    save_analysis,
    get_analysis,
    list_analyses,
    get_analysis_by_sha256,
    cleanup_expired_analyses,
)
from app.utils.hash_utils import calculate_sha256

# ── Environment ───────────────────────────────────────────────────────────────
# Set ENV=production in your server environment to harden the API.
# In development, ENV is unset or "development" — Swagger stays available.
IS_PROD = os.getenv("ENV", "development").lower() == "production"

# Max file size: 50 MB
MAX_FILE_SIZE = 50 * 1024 * 1024  # bytes

# ── Rate limiter ──────────────────────────────────────────────────────────────
limiter = Limiter(key_func=get_remote_address, default_limits=["30/minute"])

# ── App ───────────────────────────────────────────────────────────────────────
app = FastAPI(
    title="NullTrace API",
    # Disable interactive docs in production
    docs_url=None if IS_PROD else "/docs",
    redoc_url=None if IS_PROD else "/redoc",
    openapi_url=None if IS_PROD else "/openapi.json",
)

app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# ── CORS ──────────────────────────────────────────────────────────────────────
# Add your production frontend origin here.
ALLOWED_ORIGINS = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "https://nulltrace.zylox.space",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST"],
    allow_headers=["*"],
)


# ── Routes ────────────────────────────────────────────────────────────────────

@app.get("/health")
def health():
    return {"status": "ok"}


@app.post("/analyze")
@limiter.limit("10/minute")  # stricter limit on the heavy endpoint
async def analyze(request: Request, file: UploadFile = File(...)):
    # Run cleanup of expired analyses on every upload (lightweight, O(n) on disk)
    cleanup_expired_analyses()

    content = await file.read()

    if not content:
        raise HTTPException(status_code=400, detail="Empty file")

    # Enforce file size limit server-side (client-side is just UX)
    if len(content) > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=413,
            detail=f"File too large. Maximum allowed size is {MAX_FILE_SIZE // (1024 * 1024)} MB.",
        )

    sha256 = calculate_sha256(content)

    existing_analysis = get_analysis_by_sha256(sha256)
    if existing_analysis:
        existing_analysis.setdefault("suspicious_patterns", [])
        existing_analysis.setdefault("strings", [])
        existing_analysis.setdefault("iocs", {
            "urls": [], "ips": [], "emails": [], "domains": [],
        })
        existing_analysis.setdefault("risk_assessment", {
            "score": 0, "severity": "low", "reasons": [],
        })
        return {**existing_analysis, "cached": True}

    result = analyze_file(file.filename, content)
    saved_result = save_analysis(result)

    return {**saved_result, "cached": False}


@app.get("/analyses")
@limiter.limit("30/minute")
def get_all_analyses(request: Request):
    return list_analyses()


@app.get("/analyses/{analysis_id}")
@limiter.limit("30/minute")
def get_single_analysis(request: Request, analysis_id: str):
    # Basic input sanitization — UUIDs only
    import re
    if not re.match(r'^[0-9a-f-]{36}$', analysis_id):
        raise HTTPException(status_code=400, detail="Invalid analysis ID format")

    analysis = get_analysis(analysis_id)
    if not analysis:
        raise HTTPException(status_code=404, detail="Analysis not found")

    return analysis