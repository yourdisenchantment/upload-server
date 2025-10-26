# app/services/upload_service.py

from app.core.config import UPLOADS_DIR
from app.services.history_service import get_total_upload_count

from datetime import datetime
from fastapi import UploadFile
from pathlib import Path


def generate_folder_name(user_id: str, count: int) -> str:
    date_str = datetime.now().strftime("%d-%m-%Y")
    count_str = str(count).zfill(5)

    return f"{count_str}_{date_str}_{user_id}"


async def save_files(user_id: str, files: list[UploadFile]) -> dict:
    total_count = get_total_upload_count()
    new_count = total_count + 1

    folder_name = generate_folder_name(user_id, new_count)
    upload_path = UPLOADS_DIR / folder_name
    upload_path.mkdir(parents=True, exist_ok=True)

    saved_count = 0
    total_size = 0

    for file in files:
        filename = file.filename or "untitled"
        filename = Path(filename).name
        file_path = upload_path / filename

        with open(file_path, "wb") as buffer:
            content = await file.read()
            buffer.write(content)
            total_size += len(content)

        saved_count += 1

    return {
        "folder_name": folder_name,
        "files_count": saved_count,
        "total_size": total_size,
    }
