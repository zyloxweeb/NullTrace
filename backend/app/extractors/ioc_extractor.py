import re
from urllib.parse import urlparse

URL_REGEX = r"https?://[^\s\"'<>]+"
IP_REGEX = r"\b(?:\d{1,3}\.){3}\d{1,3}\b"
EMAIL_REGEX = r"\b[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,24}\b"
DOMAIN_REGEX = r"\b(?:[a-zA-Z0-9-]{1,63}\.)+[a-zA-Z]{2,24}\b"

BENIGN_INFRA_KEYWORDS = {
    "digicert",
    "ocsp",
    "cacerts",
    "crl",
    "timestamp",
    "microsoft",
    "windows",
    "verisign",
    "globalsign",
    "letsencrypt",
    "entrust",
    "sectigo",
}

def is_probably_benign_infra(value: str) -> bool:
    lowered = value.lower()
    return any(keyword in lowered for keyword in BENIGN_INFRA_KEYWORDS)

def normalize_url(url: str) -> str:
    return url.strip().rstrip(".,;:)")

def extract_domains_from_urls(urls: list[str]) -> set[str]:
    domains = set()

    for url in urls:
        try:
            parsed = urlparse(url)
            if parsed.hostname:
                domains.add(parsed.hostname.lower())
        except Exception:
            continue

    return domains

def extract_standalone_domains(strings: list[str]) -> set[str]:
    domains = set()

    for s in strings:
        for match in re.findall(DOMAIN_REGEX, s):
            lowered = match.lower()

            # evita rumore e duplicati strani
            if len(lowered) > 120:
                continue

            domains.add(lowered)

    return domains

def extract_iocs(strings: list[str]) -> dict:
    text = "\n".join(strings)

    raw_urls = sorted(set(normalize_url(u) for u in re.findall(URL_REGEX, text)))
    ips = sorted(set(re.findall(IP_REGEX, text)))
    emails = sorted(set(re.findall(EMAIL_REGEX, text)))

    url_domains = extract_domains_from_urls(raw_urls)
    standalone_domains = extract_standalone_domains(strings)

    # unione domains
    all_domains = sorted(url_domains.union(standalone_domains))

    # separa IOC "benign infrastructure" da quelli davvero interessanti
    benign_urls = sorted([u for u in raw_urls if is_probably_benign_infra(u)])
    suspicious_urls = sorted([u for u in raw_urls if not is_probably_benign_infra(u)])

    benign_domains = sorted([d for d in all_domains if is_probably_benign_infra(d)])
    suspicious_domains = sorted([d for d in all_domains if not is_probably_benign_infra(d)])

    return {
        "urls": suspicious_urls,
        "ips": ips,
        "emails": emails,
        "domains": suspicious_domains,
        "benign_urls": benign_urls,
        "benign_domains": benign_domains,
    }