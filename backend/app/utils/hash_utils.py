import hashlib

def calculate_sha256(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()

def calculate_md5(data: bytes) -> str:
    return hashlib.md5(data).hexdigest()