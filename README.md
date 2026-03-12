<p align="center">
  <img src="frontend/public/logo.svg" alt="Feeder" width="120" height="120" />
</p>

<h1 align="center">Feeder</h1>

<p align="center">
  A self-hosted LinkedIn feed widget for embedding company posts into websites and digital signage.
</p>

---

## Features

- **4 widget layouts** — Carousel, Grid, List, and Masonry
- **Admin dashboard** — Manage LinkedIn organizations, create and configure widgets with live preview
- **LinkedIn OAuth** — Connect with one click, no manual token management
- **Embeddable** — Drop an `<iframe>` into any page or digital signage platform
- **Customizable** — Theme (light/dark), accent colors, shadows, border radius, auto-rotate speed
- **Auto-caching** — Posts are fetched and cached every 30 minutes

## Tech Stack

| Layer    | Tech                                  |
|----------|---------------------------------------|
| Frontend | React, Vite, Tailwind CSS             |
| Backend  | Express, TypeScript                   |
| Database | SQLite (via better-sqlite3)           |
| Deploy   | Docker, GitHub Actions, ghcr.io       |

## Quick Start

### Prerequisites

- Node.js 22+
- A [LinkedIn Developer App](https://www.linkedin.com/developers/apps) with Client ID and Secret

### Local Development

```bash
# Backend
cd backend
cp .env.example .env   # fill in your LinkedIn credentials
npm install
npm run dev

# Frontend (in a separate terminal)
cd frontend
npm install
npm run dev
```

Open http://localhost:5173/admin to access the dashboard.

### Environment Variables

| Variable | Required | Description |
|---|---|---|
| `PORT` | No | Backend port (default: `3001`) |
| `LINKEDIN_CLIENT_ID` | Yes | From your LinkedIn Developer App |
| `LINKEDIN_CLIENT_SECRET` | Yes | From your LinkedIn Developer App |
| `FRONTEND_URL` | No | Frontend URL for CORS (default: `http://localhost:5173`) |

### LinkedIn App Setup

1. Go to [LinkedIn Developers](https://www.linkedin.com/developers/apps) and create an app
2. Add the redirect URL: `http://localhost:3001/api/auth/linkedin/callback` (or your production URL)
3. Copy the Client ID and Client Secret into your `.env`
4. In the admin dashboard, click **Connect LinkedIn** to authorize

## Docker

### Production (pre-built images)

```bash
cp backend/.env.example .env  # fill in credentials
docker compose up -d
```

Images are pulled from `ghcr.io/clucraft/feeder-backend` and `ghcr.io/clucraft/feeder-frontend`.

### Development (build from source)

```bash
docker compose -f docker-compose.dev.yml up -d
```

## Embedding

After creating a widget in the admin dashboard, embed it with:

```html
<iframe
  src="https://your-domain.com/widget/WIDGET_ID"
  width="100%"
  height="400"
  frameborder="0"
  style="border: none;"
></iframe>
```

The widget supports auto-resize via `postMessage` — add this script to the parent page for dynamic height:

```html
<script>
  window.addEventListener('message', (e) => {
    if (e.data?.type === 'feeder-resize') {
      document.querySelector('iframe').style.height = e.data.height + 'px';
    }
  });
</script>
```

## License

MIT
