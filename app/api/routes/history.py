# app/api/routes/history.py

from app.schemas.models import HistoryRecord
from app.services import history_service, user_service

from fastapi import APIRouter, HTTPException

router = APIRouter(prefix="/api", tags=["history"])


@router.get("/history/{user_id}", response_model=list[HistoryRecord])
async def get_history(user_id: str):
    if not user_service.validate_user_id(user_id):
        raise HTTPException(status_code=400, detail="Invalid user_id format")

    records = history_service.get_user_history(user_id)

    return records
