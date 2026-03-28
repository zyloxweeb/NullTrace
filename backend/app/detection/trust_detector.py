from typing import List, Dict


BENIGN_CERT_KEYWORDS = {
    "digicert",
    "ocsp",
    "cacerts",
    "crl",
    "timestamp",
    "verisign",
    "globalsign",
    "letsencrypt",
    "entrust",
    "sectigo",
    "microsoft",
    "windows",
}

INSTALLER_HINTS = {
    "setup",
    "installer",
    "installshield",
    "inno setup",
    "nsis",
    "msi",
    "bootstrapper",
    "updater",
    "uninstall",
}


def detect_trust_signals(
    filename: str,
    mime_type: str,
    strings: List[str],
    iocs: Dict,
) -> Dict:
    lowered_strings = [s.lower() for s in strings]
    filename_lower = filename.lower()

    benign_urls = iocs.get("benign_urls", [])
    benign_domains = iocs.get("benign_domains", [])

    cert_hits = 0
    matched_cert_keywords = set()

    for s in lowered_strings:
        for keyword in BENIGN_CERT_KEYWORDS:
            if keyword in s:
                cert_hits += 1
                matched_cert_keywords.add(keyword)

    installer_hits = 0
    matched_installer_hints = set()

    for hint in INSTALLER_HINTS:
        if hint in filename_lower:
            installer_hits += 1
            matched_installer_hints.add(hint)

    for s in lowered_strings:
        for hint in INSTALLER_HINTS:
            if hint in s:
                installer_hits += 1
                matched_installer_hints.add(hint)

    is_executable_like = mime_type in [
        "application/octet-stream",
        "application/x-dosexec",
        "application/x-msdownload",
    ]

    trust_score = 0
    reasons = []

    benign_infra_count = len(benign_urls) + len(benign_domains)

    if benign_infra_count > 0:
        trust_score += min(benign_infra_count * 2, 18)
        reasons.append(
            f"Detected {benign_infra_count} benign certificate / trust infrastructure references"
        )

    if cert_hits >= 3:
        trust_score += 10
        reasons.append(
            f"Detected certificate / timestamp ecosystem keywords: {', '.join(sorted(matched_cert_keywords))}"
        )

    if installer_hits >= 1 and is_executable_like:
        trust_score += 12
        reasons.append(
            f"Installer-like indicators found: {', '.join(sorted(matched_installer_hints))}"
        )

    if filename_lower.endswith((".exe", ".msi")) and installer_hits >= 1:
        trust_score += 6
        reasons.append("Filename and string context suggest installer-like artifact")

    if benign_infra_count >= 8 and cert_hits >= 3:
        trust_score += 8
        reasons.append("Benign trust infrastructure appears dominant")

    trust_score = min(trust_score, 40)

    return {
        "trust_score": trust_score,
        "is_likely_installer": installer_hits >= 1 and is_executable_like,
        "has_benign_cert_infrastructure": benign_infra_count > 0 or cert_hits >= 3,
        "matched_cert_keywords": sorted(matched_cert_keywords),
        "matched_installer_hints": sorted(matched_installer_hints),
        "reasons": reasons,
    }