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

### Optional backend (contact form)
Open a second terminal:
```bash
cd backend
python -m venv venv
venv\\Scripts\\activate.bat
pip install -r requirements.txt
python -m uvicorn main:app --reload
```

The frontend can display the website without the backend; the contact form needs the backend to save enquiries.
