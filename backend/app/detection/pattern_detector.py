from typing import List, Dict


SUSPICIOUS_PATTERNS = [
    {
        "pattern": "powershell",
        "category": "execution",
        "severity": "high",
        "description": "PowerShell usage may indicate script-based execution"
    },
    {
        "pattern": "cmd.exe",
        "category": "execution",
        "severity": "medium",
        "description": "Command shell invocation detected"
    },
    {
        "pattern": "wget",
        "category": "network",
        "severity": "medium",
        "description": "Downloader utility reference detected"
    },
    {
        "pattern": "curl",
        "category": "network",
        "severity": "medium",
        "description": "Network transfer utility reference detected"
    },
    {
        "pattern": "http://",
        "category": "network",
        "severity": "medium",
        "description": "Plain HTTP URL indicator detected"
    },
    {
        "pattern": "https://",
        "category": "network",
        "severity": "low",
        "description": "HTTPS URL indicator detected"
    },
    {
        "pattern": "base64",
        "category": "obfuscation",
        "severity": "medium",
        "description": "Possible encoded content reference detected"
    },
    {
        "pattern": "eval(",
        "category": "execution",
        "severity": "high",
        "description": "Dynamic code execution pattern detected"
    },
    {
        "pattern": "token",
        "category": "credential_access",
        "severity": "medium",
        "description": "Possible token-related string found"
    },
    {
        "pattern": "password",
        "category": "credential_access",
        "severity": "high",
        "description": "Password-related string found"
    },
    {
        "pattern": "startup",
        "category": "persistence",
        "severity": "medium",
        "description": "Startup persistence-related string found"
    },
    {
        "pattern": "registry",
        "category": "persistence",
        "severity": "medium",
        "description": "Registry-related string found"
    },
]


def detect_suspicious_patterns(strings: List[str]) -> List[Dict]:
    findings = []
    seen = set()

    lowered_strings = [s.lower() for s in strings]

    for rule in SUSPICIOUS_PATTERNS:
        pattern = rule["pattern"]

        for s in lowered_strings:
            if pattern in s:
                key = (rule["pattern"], rule["category"], rule["severity"])
                if key not in seen:
                    seen.add(key)
                    findings.append(rule)
                break

    return findings