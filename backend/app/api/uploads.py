from fastapi import APIRouter, UploadFile, File

from app.services.upload_service import save_upload

router = APIRouter(prefix="/upload", tags=["upload"])


@router.post("")
async def upload_file(file: UploadFile = File(...)):
    meta = await save_upload(file)
    return meta
