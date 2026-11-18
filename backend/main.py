"""ALM website API — content delivery and contact enquiry capture."""
import datetime as dt
import hmac
import json
import logging
import os
import pathlib
import re
import smtplib
from email.message import EmailMessage
from typing import Any

from fastapi import FastAPI, Header, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from dotenv import load_dotenv

ROOT = pathlib.Path(__file__).resolve().parent.parent
load_dotenv(ROOT / "backend" / ".env")
CONTENT_FILE = ROOT / "frontend" / "src" / "content.json"
CONTACT_FILE = ROOT / "backend" / "contacts.jsonl"
ADMIN_TOKEN = os.getenv("ADMIN_TOKEN", "")
ALLOWED_ORIGINS = [x.strip() for x in os.getenv("ALLOWED_ORIGINS", "http://localhost:5173,http://127.0.0.1:5173").split(",") if x.strip()]
logger = logging.getLogger(__name__)

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
    service: str = Field(min_length=1, max_length=120)
    message: str = Field(min_length=10, max_length=5000)

    def validate_email(self) -> bool:
        return bool(re.fullmatch(
            r"[A-Za-z0-9.!#$%&'*+/=?^_`{|}~-]+@"
            r"(?:[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?\.)+[A-Za-z]{2,63}",
            self.email.strip(),
        ))


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
    if not body.name.strip() or not body.service.strip() or not body.message.strip():
        raise HTTPException(status_code=422, detail="Name, service and message are required")
    if not body.validate_email():
        raise HTTPException(status_code=422, detail="Please provide a valid email address")
    if os.getenv("MAIL_MAILER", "smtp").lower() != "smtp":
        raise HTTPException(status_code=503, detail="Email delivery is not configured for SMTP")
    mail_host = os.getenv("MAIL_HOST", "")
    mail_username = os.getenv("MAIL_USERNAME", "")
    mail_password = os.getenv("MAIL_PASSWORD", "")
    mail_from = os.getenv("MAIL_FROM_ADDRESS", mail_username)
    admin_email = os.getenv("ADMIN_EMAIL", mail_username)
    encryption = os.getenv("MAIL_ENCRYPTION", "tls").lower()
    try:
        mail_port = int(os.getenv("MAIL_PORT", "587"))
    except ValueError:
        raise HTTPException(status_code=503, detail="Email delivery is not configured correctly")
    if not all((mail_host, mail_username, mail_password, mail_from, admin_email)):
        raise HTTPException(status_code=503, detail="Email delivery is not configured")
    if encryption not in ("tls", "starttls"):
        raise HTTPException(status_code=503, detail="Email encryption must use STARTTLS")

    CONTACT_FILE.parent.mkdir(parents=True, exist_ok=True)
    row = {
        "name": body.name.strip(),
        "email": body.email.strip(),
        "service": body.service.strip(),
        "message": body.message.strip(),
        "at": dt.datetime.now(dt.timezone.utc).isoformat(),
    }
    with CONTACT_FILE.open("a", encoding="utf-8") as stream:
        stream.write(json.dumps(row, ensure_ascii=False) + "\n")

    sender_name = os.getenv("MAIL_FROM_NAME", "ALM Global Ventures")
    admin_message = EmailMessage()
    admin_message["Subject"] = "New website enquiry"
    admin_message["From"] = f"{sender_name} <{mail_from}>"
    admin_message["To"] = admin_email
    admin_message["Reply-To"] = body.email.strip()
    admin_message.set_content(
        f"New website enquiry\n\n"
        f"Name: {body.name.strip()}\n"
        f"Email: {body.email.strip()}\n"
        f"Service: {body.service.strip()}\n\n"
        f"Message:\n{body.message.strip()}\n"
    )
    confirmation = EmailMessage()
    confirmation["Subject"] = "We received your enquiry"
    confirmation["From"] = f"{sender_name} <{mail_from}>"
    confirmation["To"] = body.email.strip()
    confirmation.set_content(
        f"Hello {body.name.strip()},\n\n"
        "Thank you for contacting ALM Global Ventures. We have received your "
        f"enquiry about {body.service.strip()} and will be in touch.\n\n"
        "ALM Global Ventures"
    )
    try:
        with smtplib.SMTP(mail_host, mail_port, timeout=20) as smtp:
            smtp.ehlo()
            smtp.starttls()
            smtp.ehlo()
            smtp.login(mail_username, mail_password)
            smtp.send_message(admin_message)
            smtp.send_message(confirmation)
    except (OSError, smtplib.SMTPException):
        logger.exception("Could not send contact enquiry emails")
        raise HTTPException(status_code=502, detail="Email delivery failed. Please try again later.")
    return {"ok": True, "message": "Thank you. Your enquiry has been sent and a confirmation email is on its way."}
