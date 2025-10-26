# app/schemas/models.py

from pydantic import BaseModel


class HistoryRecord(BaseModel):
    upload_number: int
    date: str
    user_id: str
    files_count: int
    total_size: int
    folder_name: str


class UploadResponse(BaseModel):
    success: bool
    user_id: str
    upload_number: int
    folder_name: str
    files_count: int
    total_size: int
    message: str
