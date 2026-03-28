import json
from pathlib import Path
from uuid import uuid4
from datetime import datetime


BASE_DIR = Path(__file__).resolve().parent.parent.parent
STORAGE_DIR = BASE_DIR / "storage" / "analyses"
STORAGE_DIR.mkdir(parents=True, exist_ok=True)


def generate_analysis_id() -> str:
    return str(uuid4())


def save_analysis(result: dict) -> dict:
    analysis_id = generate_analysis_id()
    created_at = datetime.utcnow().isoformat() + "Z"

    enriched_result = {
        "analysis_id": analysis_id,
        "created_at": created_at,
        **result,
    }

    file_path = STORAGE_DIR / f"{analysis_id}.json"

    with open(file_path, "w", encoding="utf-8") as f:
        json.dump(enriched_result, f, indent=2, ensure_ascii=False)

    return enriched_result


def get_analysis(analysis_id: str) -> dict | None:
    file_path = STORAGE_DIR / f"{analysis_id}.json"

    if not file_path.exists():
        return None

    with open(file_path, "r", encoding="utf-8") as f:
        return json.load(f)


def get_analysis_by_sha256(sha256: str) -> dict | None:
    for file_path in STORAGE_DIR.glob("*.json"):
        try:
            with open(file_path, "r", encoding="utf-8") as f:
                data = json.load(f)

            if data.get("sha256") == sha256:
                return data
        except Exception as e:
            print(f"[storage] errore leggendo {file_path.name}: {e}")
            continue

    return None


def list_analyses() -> list[dict]:
    analyses = []

    for file_path in STORAGE_DIR.glob("*.json"):
        try:
            with open(file_path, "r", encoding="utf-8") as f:
                data = json.load(f)

            analyses.append({
                "analysis_id": data.get("analysis_id"),
                "created_at": data.get("created_at"),
                "filename": data.get("filename"),
                "size": data.get("size"),
                "mime_type": data.get("mime_type"),
                "file_category": data.get("file_category"),
                "sha256": data.get("sha256"),
                "severity": data.get("verdict", {}).get("verdict") or data.get("risk_assessment", {}).get("severity", "low"),
                "score": data.get("verdict", {}).get("final_score") or data.get("risk_assessment", {}).get("score", 0),
            })
        except Exception as e:
            print(f"[storage] errore nella lista {file_path.name}: {e}")
            continue

    analyses.sort(key=lambda x: x.get("created_at") or "", reverse=True)
    return analyses