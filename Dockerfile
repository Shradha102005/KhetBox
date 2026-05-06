FROM python:3.11-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1

WORKDIR /app

COPY backend/requirements.prod.txt /app/backend/requirements.prod.txt
RUN pip install --upgrade pip && pip install -r /app/backend/requirements.prod.txt

COPY backend /app/backend

WORKDIR /app/backend
EXPOSE 8000

CMD ["uvicorn", "server:app", "--host", "0.0.0.0", "--port", "8000"]