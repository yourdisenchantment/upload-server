# Upload Server

Простой и удобный сервер для загрузки файлов в локальной сети с автоматическим отслеживанием истории пользователей.

---

## Особенности

- Быстрая загрузка файлов через веб-интерфейс
- Автоматическая идентификация пользователей через cookies
- История загрузок для каждого пользователя
- Адаптивный дизайн — работает на телефонах и компьютерах
- Сквозная нумерация всех загрузок
- Автоматическая организация файлов в папки
- Автоочистка старых записей (по умолчанию 1 день)

---

## Технологии

- **Backend**: FastAPI, Python 3.14+
- **Frontend**: Vanilla JavaScript, CSS
- **Package Manager**: [uv](https://github.com/astral-sh/uv)

---

## Требования

- Python 3.14+
- uv (установка: `curl -LsSf https://astral.sh/uv/install.sh | sh`)

---

## Установка и запуск

### 1. Клонировать репозиторий

```bash
git clone https://github.com/yourdisenchantment/upload-server.git
cd upload-server
```

### 2. Установить зависимости

```bash
uv sync
```

### 3. Запустить сервер

```bash
uv run uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

### 4. Открыть в браузере

```text
http://localhost:8000
```

Или с другого устройства в локальной сети:

```text
http://<IP-адрес-сервера>:8000
```

Узнать IP адрес:

- **Linux/Mac**: `ip addr show | grep "inet "`
- **Windows**: `ipconfig`

---

## Структура проекта

```text
upload-server/
├── app/
│   ├── api/routes/          # API эндпоинты
│   │   ├── pages.py         # Главная страница
│   │   ├── upload.py        # Загрузка файлов
│   │   └── history.py       # История загрузок
│   ├── core/                # Конфигурация
│   │   ├── config.py        # Настройки приложения
│   │   └── dependencies.py  # FastAPI dependencies
│   ├── schemas/             # Pydantic модели
│   │   └── models.py        # Схемы данных
│   ├── services/            # Бизнес-логика
│   │   ├── user_service.py      # Генерация user_id
│   │   ├── upload_service.py    # Загрузка файлов
│   │   └── history_service.py   # Работа с историей
│   ├── static/              # Статические файлы
│   │   ├── index.html       # Веб-интерфейс
│   │   ├── scripts/app.js   # JavaScript
│   │   ├── styles/app.css   # Стили
│   │   └── images/          # Иконки
│   └── main.py              # Точка входа
├── data/                    # Данные (создается автоматически)
│   ├── history.csv          # История загрузок
│   └── upload/              # Загруженные файлы
├── pyproject.toml           # Конфигурация проекта
└── README.md
```

---

## Конфигурация

### Основные настройки (`app/core/config.py`)

```python
USER_ID_LENGTH = 6           # Длина ID пользователя
COOKIE_NAME = "user_id"      # Имя cookie
COOKIE_AGE = 100 * 365 * 24 * 60 * 60  # Срок жизни cookie (100 лет)
```

### Изменить срок хранения истории

В `app/main.py` измените параметр `days`:

```python
history_service.cleanup_old_records(days=1)  # 1 день (по умолчанию)
```

---

## Формат данных

### Структура папок загрузок

```text
data/upload/
├── 00001_26-01-2025_abc123/
│   ├── photo1.jpg
│   └── document.pdf
├── 00002_26-01-2025_xyz789/
│   └── file.txt
└── 00003_27-01-2025_abc123/
    └── video.mp4
```

Формат: `{номер}_{дата}_{user_id}`

### Формат history.csv

```csv
date,user_id,files_count,total_size,folder_name
26-01-2025,abc123,2,1234567,00001_26-01-2025_abc123
26-01-2025,xyz789,1,234567,00002_26-01-2025_xyz789
```

---

## API

### `GET /`

Главная страница с веб-интерфейсом

### `POST /api/upload`

Загрузка файлов

**Request:**

- `files`: массив файлов (multipart/form-data)
- Cookie: `user_id` (опционально)

**Response:**

```json
{
  "success": true,
  "user_id": "abc123",
  "upload_number": 5,
  "folder_name": "00005_26-01-2025_abc123",
  "files_count": 3,
  "total_size": 1234567,
  "message": "Successfully uploaded 3 files"
}
```

### `GET /api/history/{user_id}`

Получить историю загрузок пользователя

**Response:**

```json
[
  {
    "upload_number": 5,
    "date": "26-01-2025",
    "user_id": "abc123",
    "files_count": 3,
    "total_size": 1234567,
    "folder_name": "00005_26-01-2025_abc123"
  }
]
```

---

## Безопасность

**Важно**: Этот сервер предназначен для использования в **доверенной локальной сети**.

- Нет аутентификации
- Нет ограничений по размеру файлов
- Нет проверки типов файлов
- Cookie не защищены (httponly=false для доступа из JS)

**Не используйте в публичном интернете без дополнительной защиты!**

---

## Устранение неполадок

### Браузер показывает старую версию

Жесткое обновление:

- **Chrome/Edge**: `Ctrl + Shift + R`
- **Firefox**: `Ctrl + F5`
- **Safari**: `Cmd + Option + R`

### История не загружается

1. Проверьте наличие cookie `user_id` в DevTools (F12 -> Application -> Cookies)
2. Очистите cookies и загрузите файлы заново
3. Проверьте Console (F12) на наличие ошибок

---

## Разработка

### Установка зависимостей для разработки

```bash
uv sync --group dev
```

### Форматирование кода

```bash
uv run ruff format .
```

### Проверка кода

```bash
uv run ruff check .
```
