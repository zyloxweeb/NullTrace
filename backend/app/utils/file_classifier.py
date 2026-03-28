def classify_file(mime_type: str, filename: str) -> str:
    extension = filename.lower().rsplit(".", 1)[-1] if "." in filename else ""

    if mime_type.startswith("image/"):
        return "image"

    if mime_type.startswith("text/"):
        return "text"

    if mime_type in [
        "application/json",
        "application/xml",
        "application/javascript"
    ]:
        return "text"

    if extension in ["exe", "dll", "sys"]:
        return "executable"

    if extension in ["txt", "log", "csv", "json", "xml", "yaml", "yml"]:
        return "text"

    if extension in ["zip", "rar", "7z", "tar", "gz"]:
        return "archive"

    return "generic_binary"