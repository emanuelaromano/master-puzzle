import httpx
from fastapi import FastAPI, HTTPException, Query
from fastapi.responses import Response
from urllib.parse import urlparse

app = FastAPI()

PICSUM_URL = "https://picsum.photos/seed/puzzle/800/600"
ALLOWED_IMAGE_HOSTS = {"images.metmuseum.org"}

@app.get("/")
def root():
    return {"message": "Hello from API"}


@app.get("/api/image-proxy")
async def image_proxy(url: str = Query(..., min_length=1)):
    try:
        parsed = urlparse(url)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail="Invalid URL") from exc

    if parsed.scheme not in {"http", "https"}:
        raise HTTPException(status_code=400, detail="Unsupported URL scheme")
    if parsed.hostname not in ALLOWED_IMAGE_HOSTS:
        raise HTTPException(status_code=400, detail="Image host not allowed")

    try:
        async with httpx.AsyncClient(timeout=20.0, follow_redirects=True) as client:
            upstream = await client.get(url)
    except httpx.HTTPError as exc:
        raise HTTPException(status_code=502, detail=f"Failed to fetch upstream image: {exc}") from exc

    if upstream.status_code >= 400:
        raise HTTPException(status_code=upstream.status_code, detail="Upstream image request failed")

    content_type = upstream.headers.get("content-type", "image/jpeg")
    return Response(content=upstream.content, media_type=content_type)
