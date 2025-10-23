# app/services/history_service.py

from app.core.config import HISTORY_FILE
from app.schemas.models import HistoryRecord

from datetime import datetime

import csv
import shutil


def add_record(
    user_id: str, files_count: int, total_size: int, folder_name: str
) -> None:
    date_str = datetime.now().strftime("%d-%m-%Y")

    with open(HISTORY_FILE, "a", newline="", encoding="utf-8") as file:
        writer = csv.writer(file)
        writer.writerow(
            [
                date_str,
                user_id,
                files_count,
                total_size,
                folder_name,
            ]
        )


def get_user_history(user_id: str) -> list[HistoryRecord]:
    records = []

    try:
        with open(HISTORY_FILE, "r", encoding="utf-8") as file:
            reader = csv.DictReader(file)

            for row in reader:
                if row["user_id"] == user_id:
                    records.append(
                        HistoryRecord(
                            date=row["date"],
                            user_id=row["user_id"],
                            files_count=int(row["files_count"]),
                            total_size=int(row["total_size"]),
                            folder_name=row["folder_name"],
                        )
                    )

    except FileNotFoundError:
        return []

    except KeyError:
        migrate_history_format()
        return get_user_history(user_id)

    return list(reversed(records))


def get_today_upload_count(user_id: str) -> int:
    today = datetime.now().strftime("%d-%m-%Y")
    count = 0

    try:
        with open(HISTORY_FILE, "r", encoding="utf-8") as file:
            reader = csv.DictReader(file)

            for row in reader:
                if row["user_id"] == user_id and row["date"] == today:
                    count += 1

    except FileNotFoundError:
        return 0

    return count


def migrate_history_format():
    backup_file = HISTORY_FILE.parent / "history_backup.csv"

    try:
        shutil.copy(HISTORY_FILE, backup_file)

        old_records = []
        with open(HISTORY_FILE, "r", encoding="utf-8") as file:
            reader = csv.DictReader(file)
            for row in reader:
                old_records.append(row)

        with open(HISTORY_FILE, "w", newline="", encoding="utf-8") as file:
            writer = csv.writer(file)
            writer.writerow(
                ["date", "user_id", "files_count", "total_size", "folder_name"]
            )

            for row in old_records:
                writer.writerow(
                    [
                        row["date"],
                        row["user_id"],
                        row["files_count"],
                        0,
                        row["folder_name"],
                    ]
                )

        print(f"SUCCESS. Backup: {backup_file}")

    except Exception as error:
        print(f"ERROR: {error}")
        if backup_file.exists():
            shutil.copy(backup_file, HISTORY_FILE)
