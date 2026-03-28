from app.utils.hash_utils import calculate_sha256, calculate_md5
from app.utils.entropy import calculate_entropy
from app.utils.file_info import detect_mime_type
from app.utils.file_classifier import classify_file
from app.extractors.string_extractor import extract_ascii_strings
from app.extractors.ioc_extractor import extract_iocs
from app.scoring.basic_score import calculate_risk_score
from app.scoring.verdict_engine import calculate_verdict
from app.detection.pattern_detector import detect_suspicious_patterns
from app.detection.trust_detector import detect_trust_signals


def analyze_file(filename: str, data: bytes) -> dict:
    mime_type = detect_mime_type(filename)
    file_category = classify_file(mime_type, filename)
    entropy = calculate_entropy(data)

    strings = []
    iocs = {
        "urls": [],
        "ips": [],
        "emails": [],
        "domains": [],
        "benign_urls": [],
        "benign_domains": [],
    }

    if file_category in ["text", "executable", "generic_binary"]:
        strings = extract_ascii_strings(data)
        iocs = extract_iocs(strings)

    suspicious_patterns = detect_suspicious_patterns(strings)

    risk = calculate_risk_score(
        entropy=entropy,
        iocs=iocs,
        strings=strings,
        mime_type=mime_type,
        suspicious_patterns=suspicious_patterns,
    )

    trust_assessment = detect_trust_signals(
        filename=filename,
        mime_type=mime_type,
        strings=strings,
        iocs=iocs,
    )

    verdict = calculate_verdict(
        risk_score=risk["score"],
        trust_assessment=trust_assessment,
        suspicious_patterns=suspicious_patterns,
        iocs=iocs,
    )

    return {
        "filename": filename,
        "size": len(data),
        "mime_type": mime_type,
        "file_category": file_category,
        "sha256": calculate_sha256(data),
        "md5": calculate_md5(data),
        "entropy": entropy,
        "strings": strings[:50],
        "iocs": iocs,
        "suspicious_patterns": suspicious_patterns,
        "risk_assessment": risk,
        "trust_assessment": trust_assessment,
        "verdict": verdict,
    }