# app/api/routes/pages.py

from fastapi import APIRouter
from fastapi.responses import FileResponse
from pathlib import Path

router = APIRouter()

STATIC_DIR = Path(__file__).resolve().parent.parent.parent / "static"


@router.get("/")
async def index():
    return FileResponse(STATIC_DIR / "index.html")
