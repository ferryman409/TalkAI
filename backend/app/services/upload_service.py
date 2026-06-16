import os
import uuid
import mimetypes
from fastapi import UploadFile

from app.config import settings


async def save_upload(file: UploadFile) -> dict:
    """Save an uploaded file to disk and return metadata."""
    os.makedirs(settings.upload_dir, exist_ok=True)

    ext = os.path.splitext(file.filename or "file")[1] or ".bin"
    safe_name = uuid.uuid4().hex + ext
    filepath = os.path.join(settings.upload_dir, safe_name)

    content = await file.read()
    with open(filepath, "wb") as f:
        f.write(content)

    mime_type = file.content_type or mimetypes.guess_type(file.filename)[0] or "application/octet-stream"
    file_type = "audio" if mime_type.startswith("audio/") else "image"

    return {
        "id": uuid.uuid4().hex,
        "type": file_type,
        "filename": file.filename or "file",
        "url": f"/uploads/{safe_name}",
        "mime_type": mime_type,
        "file_size": len(content),
    }
