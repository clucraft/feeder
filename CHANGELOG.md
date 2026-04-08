# Changelog

All notable changes to this project will be documented in this file.

## [0.9.0] - 2026-04-08

### Changed
- Removed "LinkedIn Accounts" section from admin UI
  - Widget creation no longer requires selecting an organization
  - Backend auto-creates a default organization behind the scenes
  - Simplified flow: create widget → paste LinkedIn URL → pick layout → done
- Admin sidebar now only shows "Widgets"
- Admin default page redirects to Widgets instead of LinkedIn Accounts

### Removed
- OrganizationsPage and all organization CRUD UI
- Organization-related API functions from frontend client

## [0.8.0] - 2026-04-08

### Added
- LinkedIn web scraper to replace OAuth API-based post fetching
  - Voyager API scraping with `li_at` session cookie (primary method)
  - HTML/cheerio fallback for unauthenticated scraping
  - No headless browser required — Docker image stays lightweight
- New env vars: `LINKEDIN_LI_AT`, `LINKEDIN_JSESSIONID`
- `cheerio` dependency for HTML parsing

### Changed
- `refreshAllPosts()` now uses scraper instead of LinkedIn OAuth API
- Admin refresh endpoint uses scraper
- No longer requires LinkedIn Community Management API approval

### Removed
- OAuth-based `fetchOrganizationPosts()` and related API functions
- Dependency on `LINKEDIN_CLIENT_ID`/`LINKEDIN_CLIENT_SECRET` for post fetching

## [0.7.0] - 2026-03-16

### Fixed
- API response field name mismatch between backend and frontend/embed
  - `author_avatar` → `author_avatar_url`
  - `likes_count` → `like_count`, `comments_count` → `comment_count`, `shares_count` → `share_count`
  - Transform applied at the API layer so DB schema stays unchanged
  - Fixes broken avatar images and engagement stats in widget embeds
- Touch swipe support added to all widget layouts (carousel, grid, list, masonry)

## [0.6.0] - 2026-03-12

### Changed
- Moved LinkedIn Page URL from organizations to widgets
  - Each widget now has its own LinkedIn Page URL field
  - Multiple widgets can pull from different LinkedIn pages
  - Organizations renamed to "LinkedIn Accounts" (just hold OAuth tokens)
- Organization creation simplified — only requires a name
- Posts now stored per LinkedIn URL, not per organization
- Cron refresh iterates widgets and fetches posts per LinkedIn URL

## [0.5.0] - 2026-03-12

### Added
- Script-based embed (`embed.js`) as alternative to iframe
  - Injects widget directly into host page DOM via Shadow DOM
  - Click-to-expand modal overlays the full page (not constrained by iframe)
  - Self-contained vanilla JS, no dependencies
  - CORS-enabled with 1-hour cache
- Carousel improvements:
  - Fixed-height tiles (380px) with content line-clamping
  - Click any tile to open scrollable full-feed modal
  - Modal: backdrop blur, Escape/click-to-close, body scroll lock
- Admin dashboard shows both embed options (script recommended, iframe fallback)
- Widget editor has tabbed embed code section
- Dark mode theme toggle (sun/moon icon) in admin sidebar and login page

## [0.4.0] - 2026-03-12

### Added
- Demo mode with 6 sample LinkedIn posts for testing widgets without API access
- "Add Demo Organization" button in admin (no LinkedIn token required)
- Widget embeds and previews fall back to demo data when no real posts exist
- Subtle "Demo Mode" banner on widget embeds using sample data

## [0.3.0] - 2026-03-12

### Added
- Admin authentication with JWT-based sessions
  - Login page with username/password
  - `requireAuth` middleware protecting all `/api/admin/*` routes
  - Credentials configured via `ADMIN_USERNAME`, `ADMIN_PASSWORD`, `JWT_SECRET` env vars
  - Logout button in admin sidebar
  - Auto-redirect to login on 401 responses
- Widget and OAuth routes remain public (no auth required)

## [0.2.0] - 2026-03-12

### Added
- LinkedIn OAuth 2.0 flow — no more manual access tokens
  - `GET /api/auth/linkedin` initiates OAuth redirect
  - `GET /api/auth/linkedin/callback` handles token exchange
  - Temp token storage with 10-minute expiry for secure org creation
- Token expiry tracking on organizations (`token_expires_at` column)
- `exchangeCodeForToken()` and `fetchOrganizationProfile()` LinkedIn service functions
- "Connect LinkedIn" button in admin replaces manual token input

### Changed
- Organization creation now uses OAuth temp tokens instead of raw access tokens
- `refreshAllPosts()` skips organizations with expired tokens
- Removed `LINKEDIN_ACCESS_TOKEN` and `LINKEDIN_ORGANIZATION_ID` from env (no longer needed)
- Added `LINKEDIN_REDIRECT_URI` to env config

## [0.1.0] - 2026-03-12

### Added
- Initial project scaffold
- **Backend**: Express + TypeScript + SQLite server
  - LinkedIn API integration for fetching organization posts
  - Automatic post caching with 30-minute refresh cron job
  - Admin API for managing organizations and widgets
  - Public widget API for serving embed data
- **Frontend**: React + Vite + Tailwind application
  - Embeddable widget with 4 layout options:
    - Carousel (3 visible posts, auto-rotate + manual navigation)
    - Grid (responsive columns)
    - List (vertical feed)
    - Masonry (staggered grid)
  - Admin dashboard with sidebar navigation
    - Organization management (connect LinkedIn pages, refresh posts)
    - Widget editor with live preview
    - Layout-specific configuration (rotation speed, column count, etc.)
    - Theme settings (light/dark mode, accent color, shadows, border radius)
    - Embed code generator with copy button
  - PostCard component with author info, content, media, and engagement stats
- Docker setup with Dockerfiles for both services
- `docker-compose.yml` for production (pulls from ghcr.io/clucraft)
- `docker-compose.dev.yml` for local development (builds from source)
- GitHub Actions CI/CD workflow to build and publish Docker images to ghcr.io on push to main
- CHANGELOG.md for tracking changes
