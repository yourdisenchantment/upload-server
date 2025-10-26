# app/main.py

from app.api.routes import pages, upload, history
from app.services import history_service

from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from pathlib import Path


@asynccontextmanager
async def lifespan(app: FastAPI):
    history_service.cleanup_old_records(days=1)
    yield


app = FastAPI(
    title="File Upload Server",
    description="Local network file upload server with user tracking",
    version="0.1.0",
    lifespan=lifespan,
)

STATIC_DIR = Path(__file__).resolve().parent / "static"
app.mount("/static", StaticFiles(directory=str(STATIC_DIR)), name="static")

app.include_router(pages.router)
app.include_router(upload.router)
app.include_router(history.router)


@app.middleware("http")
async def disable_caching(request, call_next):
    response = await call_next(request)

    if request.url.path == "/" or request.url.path.startswith("/static/"):
        response.headers["Cache-Control"] = (
            "no-store, no-cache, must-revalidate, max-age=0"
        )
        response.headers["Pragma"] = "no-cache"
        response.headers["Expires"] = "0"

    return response


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
    )
