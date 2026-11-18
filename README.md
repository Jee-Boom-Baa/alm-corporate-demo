# ALM Global Ventures Website

A responsive React + Vite corporate website for ALM Global Ventures.

## Pages
- Home
- About Us
- Our Businesses
- Markets
- Vision & Mission
- Contact

## Run locally

### Frontend
```bash
cd frontend
npm install
npm run dev
```
Open the local URL printed by Vite (normally http://localhost:5173).

### Backend (required for the contact form)
Open a second terminal:
```bash
cd backend
python -m venv venv
venv\\Scripts\\activate.bat
pip install -r requirements.txt
python -m uvicorn main:app --reload --host 127.0.0.1 --port 8000
```

The frontend can display the website without the backend. The contact form needs the backend and SMTP configuration to send enquiries.

### Configure contact email

Copy `backend/.env.example` to `backend/.env` and fill in your SMTP settings. The API automatically reads that file on startup; existing environment variables take precedence. Restart the API after changing the file. Keep the Gmail app password out of source control and frontend configuration; rotate it if it has been shared.

```text
MAIL_MAILER=smtp
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=your-mailbox@gmail.com
MAIL_PASSWORD=your-gmail-app-password
MAIL_ENCRYPTION=tls
MAIL_FROM_ADDRESS=your-mailbox@gmail.com
MAIL_FROM_NAME=ALM Global Ventures
ADMIN_EMAIL=your-mailbox@gmail.com
```

`ADMIN_EMAIL` receives the enquiry notification. The visitor receives an automatic confirmation. If `ADMIN_EMAIL` is not set, the backend sends the notification to `MAIL_USERNAME`. The contact endpoint returns an error to the website if email delivery is not configured or SMTP sending fails.

Check `http://127.0.0.1:8000/api/health` to confirm the API is running, and `http://127.0.0.1:5173/api/health` to confirm the Vite proxy reaches it. Both should return `ok: true`. Restart Vite after changing its proxy configuration.
