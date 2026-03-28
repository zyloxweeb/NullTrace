import re


def extract_ascii_strings(data: bytes, min_length: int = 6) -> list[str]:
    pattern = rb"[\x20-\x7E]{" + str(min_length).encode() + rb",}"
    matches = re.findall(pattern, data)

    decoded = []
    seen = set()

    for match in matches:
        s = match.decode("utf-8", errors="ignore").strip()

        if not s:
            continue

        # deve contenere almeno una lettera
        if not any(c.isalpha() for c in s):
            continue

        if s not in seen:
            seen.add(s)
            decoded.append(s)

    return decoded
