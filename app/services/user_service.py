# app/services/user_service.py

from app.core.config import USER_ID_LENGTH, USER_ID_CHARS

import random


def generate_user_id() -> str:
    return "".join(random.choices(USER_ID_CHARS, k=USER_ID_LENGTH))


def validate_user_id(user_id: str) -> bool:
    if not user_id or len(user_id) != USER_ID_LENGTH:
        return False

    return all(c in USER_ID_CHARS for c in user_id)
