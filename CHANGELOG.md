# Changelog

All notable changes to this project will be documented in this file.

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
