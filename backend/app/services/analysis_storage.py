import json
from pathlib import Path
from uuid import uuid4
from datetime import datetime, timezone, timedelta


BASE_DIR = Path(__file__).resolve().parent.parent.parent
STORAGE_DIR = BASE_DIR / "storage" / "analyses"
STORAGE_DIR.mkdir(parents=True, exist_ok=True)

# How long to keep analysis results on disk
ANALYSIS_TTL_HOURS = 24


def generate_analysis_id() -> str:
    return str(uuid4())


def save_analysis(result: dict) -> dict:
    analysis_id = generate_analysis_id()
    created_at = datetime.now(timezone.utc).isoformat()

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
    cutoff = datetime.now(timezone.utc) - timedelta(hours=ANALYSIS_TTL_HOURS)

    for file_path in STORAGE_DIR.glob("*.json"):
        try:
            with open(file_path, "r", encoding="utf-8") as f:
                data = json.load(f)

            if data.get("sha256") != sha256:
                continue

            # Don't serve expired cached results — let them be re-analyzed
            created_raw = data.get("created_at", "")
            try:
                created_at = datetime.fromisoformat(created_raw)
                # Ensure timezone-aware for comparison
                if created_at.tzinfo is None:
                    created_at = created_at.replace(tzinfo=timezone.utc)
                if created_at < cutoff:
                    continue
            except ValueError:
                # Unparseable date — skip the cache, play it safe
                continue

            return data

        except Exception as e:
            print(f"[storage] error reading {file_path.name}: {e}")
            continue

    return None


def list_analyses() -> list[dict]:
    analyses = []
    cutoff = datetime.now(timezone.utc) - timedelta(hours=ANALYSIS_TTL_HOURS)

    for file_path in STORAGE_DIR.glob("*.json"):
        try:
            with open(file_path, "r", encoding="utf-8") as f:
                data = json.load(f)

            # Skip expired entries from the list
            created_raw = data.get("created_at", "")
            try:
                created_at = datetime.fromisoformat(created_raw)
                if created_at.tzinfo is None:
                    created_at = created_at.replace(tzinfo=timezone.utc)
                if created_at < cutoff:
                    continue
            except ValueError:
                continue

            analyses.append({
                "analysis_id": data.get("analysis_id"),
                "created_at": data.get("created_at"),
                "filename": data.get("filename"),
                "size": data.get("size"),
                "mime_type": data.get("mime_type"),
                "file_category": data.get("file_category"),
                "sha256": data.get("sha256"),
                "severity": (
                    data.get("verdict", {}).get("verdict")
                    or data.get("risk_assessment", {}).get("severity", "low")
                ),
                "score": (
                    data.get("verdict", {}).get("final_score")
                    or data.get("risk_assessment", {}).get("score", 0)
                ),
            })

        except Exception as e:
            print(f"[storage] error listing {file_path.name}: {e}")
            continue

    analyses.sort(key=lambda x: x.get("created_at") or "", reverse=True)
    return analyses


def cleanup_expired_analyses() -> int:
    """
    Delete analysis JSON files older than ANALYSIS_TTL_HOURS.
    Called automatically on every /analyze request.
    Returns the number of files deleted.
    """
    cutoff = datetime.now(timezone.utc) - timedelta(hours=ANALYSIS_TTL_HOURS)
    deleted = 0

    for file_path in STORAGE_DIR.glob("*.json"):
        try:
            with open(file_path, "r", encoding="utf-8") as f:
                data = json.load(f)

            created_raw = data.get("created_at", "")
            try:
                created_at = datetime.fromisoformat(created_raw)
                if created_at.tzinfo is None:
                    created_at = created_at.replace(tzinfo=timezone.utc)
            except ValueError:
                # Unparseable date — delete the file to be safe
                file_path.unlink(missing_ok=True)
                deleted += 1
                continue

            if created_at < cutoff:
                file_path.unlink(missing_ok=True)
                deleted += 1
                print(f"[storage] expired and removed: {file_path.name}")

        except Exception as e:
            print(f"[storage] cleanup error on {file_path.name}: {e}")
            continue

    if deleted:
        print(f"[storage] cleanup complete — {deleted} file(s) removed")

    return deleted
