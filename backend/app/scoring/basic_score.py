def calculate_risk_score(
    entropy: float,
    iocs: dict,
    strings: list[str],
    mime_type: str,
    suspicious_patterns: list[dict],
) -> dict:
    score = 0
    reasons = []

    image_like = mime_type.startswith("image/")
    text_like = mime_type.startswith("text/")

    suspicious_url_count = len(iocs.get("urls", []))
    suspicious_domain_count = len(iocs.get("domains", []))
    suspicious_ioc_count = (
        suspicious_url_count
        + suspicious_domain_count
        + len(iocs.get("ips", []))
        + len(iocs.get("emails", []))
    )

    benign_ioc_count = len(iocs.get("benign_urls", [])) + len(iocs.get("benign_domains", []))

    if entropy > 7.2 and not image_like:
        score += 15
        reasons.append("High file entropy")

    if suspicious_ioc_count > 0:
        ioc_score = min(suspicious_ioc_count * 8, 24)
        score += ioc_score
        reasons.append(f"Found {suspicious_ioc_count} suspicious IOCs")

    high_patterns = sum(1 for p in suspicious_patterns if p["severity"] == "high")
    medium_patterns = sum(1 for p in suspicious_patterns if p["severity"] == "medium")
    low_patterns = sum(1 for p in suspicious_patterns if p["severity"] == "low")

    pattern_score = min(high_patterns * 15 + medium_patterns * 8 + low_patterns * 4, 35)

    if pattern_score > 0:
        score += pattern_score
        reasons.append(
            f"Detected suspicious patterns: {len(suspicious_patterns)} "
            f"(high={high_patterns}, medium={medium_patterns}, low={low_patterns})"
        )

    if mime_type in ["application/octet-stream", "application/x-dosexec"]:
        score += 6
        reasons.append("Executable or unknown binary type")

    if benign_ioc_count > 0:
        reasons.append(f"Detected {benign_ioc_count} benign certificate/network infrastructure references")

    # riduzione score per installer normali con tanti riferimenti certificati
    if benign_ioc_count >= 5 and suspicious_ioc_count == 0 and high_patterns == 0:
        score = max(score - 18, 0)
        reasons.append("Benign certificate/timestamp infrastructure appears dominant")

    if image_like and suspicious_ioc_count == 0 and not suspicious_patterns:
        reasons.append("Compressed image format; high entropy may be normal")

    if text_like and entropy < 1.5:
        reasons.append("Low entropy text-like file")

    score = min(score, 100)

    if score >= 75:
        severity = "high"
    elif score >= 40:
        severity = "medium"
    else:
        severity = "low"

    return {
        "score": score,
        "severity": severity,
        "reasons": reasons
    }