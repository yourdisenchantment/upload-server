# app/core/config.py

from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent.parent
DATA_DIR = BASE_DIR / "data"
UPLOADS_DIR = DATA_DIR / "upload"
HISTORY_FILE = DATA_DIR / "history.csv"

UPLOADS_DIR.mkdir(parents=True, exist_ok=True)
DATA_DIR.mkdir(parents=True, exist_ok=True)

USER_ID_LENGTH = 6
USER_ID_CHARS = [str(i) for i in range(0, 10)] + [
    chr(i) for i in range(ord("a"), ord("z") + 1)
]

COOKIE_NAME = "user_id"
COOKIE_AGE = 100 * 365 * 24 * 60 * 60

if not HISTORY_FILE.exists():
    HISTORY_FILE.write_text(
        "date,user_id,files_count,total_size,folder_name\n", encoding="utf-8"
    )
