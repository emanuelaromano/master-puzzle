# Build client
FROM --platform=linux/amd64 node:20-alpine AS client
WORKDIR /app/client
ENV NO_UPDATE_NOTIFIER=1
COPY client/package.json client/package-lock.json ./
RUN npm ci
COPY client/ ./
RUN npm run build

# Run server + static client
FROM --platform=linux/amd64 python:3.11-slim
WORKDIR /app

ENV PYTHONUNBUFFERED=1
ENV STATIC_DIR=/app/static

COPY server/requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt
COPY server/ ./

COPY --from=client /app/client/dist ./static

EXPOSE 8080
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8080"]
