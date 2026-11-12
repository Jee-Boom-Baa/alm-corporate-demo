"""ALM website API — content delivery and contact enquiry capture."""
import datetime as dt
import hmac
import json
import os
import pathlib
import re
from typing import Any

from fastapi import FastAPI, Header, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

ROOT = pathlib.Path(__file__).resolve().parent.parent
CONTENT_FILE = ROOT / "frontend" / "src" / "content.json"
CONTACT_FILE = ROOT / "backend" / "contacts.jsonl"
ADMIN_TOKEN = os.getenv("ADMIN_TOKEN", "")
ALLOWED_ORIGINS = [x.strip() for x in os.getenv("ALLOWED_ORIGINS", "http://localhost:5173").split(",") if x.strip()]

app = FastAPI(title="ALM Website API", version="1.1.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=False,
    allow_methods=["GET", "POST", "PUT", "OPTIONS"],
    allow_headers=["Content-Type", "X-Admin-Token"],
)

class ContactRequest(BaseModel):
    name: str = Field(min_length=2, max_length=120)
    email: str = Field(min_length=5, max_length=254)
    message: str = Field(min_length=10, max_length=5000)

    def validate_email(self) -> bool:
        return bool(re.fullmatch(r"[^\s@]+@[^\s@]+\.[^\s@]+", self.email))


def load_content() -> dict[str, Any]:
    try:
        return json.loads(CONTENT_FILE.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError):
        raise HTTPException(status_code=500, detail="Website content is temporarily unavailable")


@app.get("/api/health")
def health():
    return {"ok": True, "service": "alm-website-api"}


@app.get("/api/content")
def content():
    return load_content()


@app.get("/api/content/{section}")
def section(section: str):
    data = load_content()
    if section not in data:
        raise HTTPException(status_code=404, detail="Unknown content section")
    return data[section]


@app.put("/api/content")
def update(body: dict, x_admin_token: str = Header(default="")):
    if not ADMIN_TOKEN:
        raise HTTPException(status_code=503, detail="Content editing is not configured")
    if not hmac.compare_digest(x_admin_token, ADMIN_TOKEN):
        raise HTTPException(status_code=401, detail="Invalid admin token")
    temp = CONTENT_FILE.with_suffix(".json.tmp")
    temp.write_text(json.dumps(body, indent=2, ensure_ascii=False), encoding="utf-8")
    temp.replace(CONTENT_FILE)
    return {"ok": True}


@app.post("/api/contact")
def contact(body: ContactRequest):
    if not body.validate_email():
        raise HTTPException(status_code=422, detail="Please provide a valid email address")
    CONTACT_FILE.parent.mkdir(parents=True, exist_ok=True)
    row = {
        "name": body.name.strip(),
        "email": body.email.strip(),
        "message": body.message.strip(),
        "at": dt.datetime.now(dt.timezone.utc).isoformat(),
    }
    with CONTACT_FILE.open("a", encoding="utf-8") as stream:
        stream.write(json.dumps(row, ensure_ascii=False) + "\n")
    return {"ok": True, "message": "Thank you. Your enquiry has been received."}
