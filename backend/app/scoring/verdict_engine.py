def calculate_verdict(
    risk_score: int,
    trust_assessment: dict,
    suspicious_patterns: list[dict],
    iocs: dict,
) -> dict:
    trust_score = trust_assessment.get("trust_score", 0)
    final_score = max(risk_score - trust_score, 0)

    high_patterns = sum(1 for p in suspicious_patterns if p.get("severity") == "high")
    suspicious_ioc_count = (
        len(iocs.get("urls", []))
        + len(iocs.get("domains", []))
        + len(iocs.get("ips", []))
        + len(iocs.get("emails", []))
    )

    likely_installer = trust_assessment.get("is_likely_installer", False)
    benign_infra = trust_assessment.get("has_benign_cert_infrastructure", False)

    if high_patterns >= 2 or final_score >= 75:
        verdict = "high_risk"
    elif final_score >= 45:
        verdict = "suspicious"
    elif likely_installer and benign_infra and suspicious_ioc_count <= 2 and high_patterns == 0:
        verdict = "likely_benign"
    elif final_score <= 20:
        verdict = "benign"
    else:
        verdict = "likely_benign"

    if verdict == "high_risk":
        confidence = "medium" if benign_infra else "high"
    elif verdict == "suspicious":
        confidence = "medium"
    elif verdict == "likely_benign":
        confidence = "medium" if suspicious_ioc_count > 0 else "high"
    else:
        confidence = "medium"

    reasons = []

    if trust_score > 0:
        reasons.append(f"Trust score reduced risk by {trust_score} points")

    if likely_installer:
        reasons.append("Artifact matches installer-like profile")

    if benign_infra:
        reasons.append("Benign certificate / timestamp infrastructure detected")

    if high_patterns > 0:
        reasons.append(f"Detected {high_patterns} high-severity suspicious patterns")

    if suspicious_ioc_count > 0:
        reasons.append(f"Detected {suspicious_ioc_count} suspicious IOCs")

    return {
        "raw_risk_score": risk_score,
        "trust_score": trust_score,
        "final_score": final_score,
        "verdict": verdict,
        "confidence": confidence,
        "reasons": reasons,
    }