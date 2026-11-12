# ALM — Premium corporate website

A responsive, multi-page corporate website for ALM, built with React 18, React Router and Vite. The visual direction uses a restrained investment-house palette (midnight navy, warm ivory and champagne gold), editorial display typography and responsive layouts.

## Included pages

- `/` — Home / brand introduction
- `/who-we-are` — Strategy, principles, leadership and locations
- `/what-we-do` — Services and investment capabilities
- `/how-we-think` — Insights and investment approach
- `/why-join-us` — Careers and culture
- `/media-centre` — News and media content
- `/contact` — Enquiry form

These are separate page routes within one website. Separate domains or independently deployed microsites can be added once their names, audiences and content are defined.

## Frontend setup

```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:5173`. The site includes bundled content and therefore renders without the API. Google Fonts are loaded remotely (Playfair Display, Manrope and DM Sans); provide licensed self-hosted font files if the production environment blocks third-party font requests.

Production build:

```bash
npm run build
npm run preview
```

## Backend setup (optional)

```bash
cd backend
python -m venv .venv
# Windows: .venv\\Scripts\\activate
# macOS/Linux: source .venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

The Vite development proxy forwards `/api` requests to the backend. Configure `ALLOWED_ORIGINS` as a comma-separated list of trusted production origins. Set a long, unique `ADMIN_TOKEN` before enabling `PUT /api/content`; content editing is disabled when the variable is absent. Contact enquiries are appended to `backend/contacts.jsonl`.

## Content and brand assets

- Edit page copy, navigation, people, statistics and locations in `frontend/src/content.json`.
- Replace `frontend/public/logo.jpg` with the approved ALM brand banner/logo asset.
- Leadership entries marked `Full Name` are intentionally rendered as “Profile coming soon”; replace them with approved names and biographies before launch.
- Update page titles, metadata and social sharing metadata in `frontend/index.html`.

## Production checklist

1. Confirm the legal company name, approved brand assets, leadership details, office addresses and regulatory disclosures.
2. Replace placeholder copy and verify all external destinations.
3. Configure HTTPS, trusted CORS origins, a strong admin token and persistent storage for enquiries.
4. Add a transactional email/CRM provider if enquiries must notify a team; the current API stores submissions but does not send email.
5. Add a privacy notice, cookie policy and consent tooling appropriate to the markets served.
6. Run `npm run build` and test the deployed routes, contact form, mobile navigation and keyboard accessibility.

## API

- `GET /api/health`
- `GET /api/content`
- `GET /api/content/{section}`
- `PUT /api/content` (requires `X-Admin-Token`)
- `POST /api/contact`
