# app/api/routes/upload.py

from app.core.config import COOKIE_NAME, COOKIE_AGE
from app.schemas.models import UploadResponse
from app.services import upload_service, user_service, history_service

from fastapi import APIRouter, UploadFile, File, Response, HTTPException, Cookie

router = APIRouter(prefix="/api", tags=["upload"])


@router.post("/upload", response_model=UploadResponse)
async def upload_files(
    response: Response,
    files: list[UploadFile] = File(...),
    user_id: str | None = Cookie(None, alias=COOKIE_NAME),
):
    if not files:
        raise HTTPException(status_code=400, detail="No files provided")

    is_new_user = False

    if not user_id:
        user_id = user_service.generate_user_id()
        is_new_user = True

    try:
        result = await upload_service.save_files(user_id, files)
        upload_number = int(result["folder_name"].split("_")[0])
        history_service.add_record(
            user_id=user_id,
            files_count=result["files_count"],
            total_size=result["total_size"],
            folder_name=result["folder_name"],
        )

        if is_new_user:
            response.set_cookie(
                key=COOKIE_NAME,
                value=user_id,
                max_age=COOKIE_AGE,
                httponly=False,
                samesite="lax",
            )

        return UploadResponse(
            success=True,
            user_id=user_id,
            upload_number=upload_number,
            folder_name=result["folder_name"],
            files_count=result["files_count"],
            total_size=result["total_size"],
            message=f"Successfully uploaded {result['files_count']} files",
        )

    except Exception as error:
        raise HTTPException(status_code=500, detail=f"Error saving files: {str(error)}")
