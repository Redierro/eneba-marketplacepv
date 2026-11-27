# Eneba Marketplace

Digital game key marketplace built for the Eneba internship assignment.

**Live:** https://YOUR-APP.vercel.app  
**AI log:** see `ai-logs/` (full conversation link/export)

## Stack
- Frontend: React + TypeScript, Vite, React Router, TanStack Query, Tailwind
- Backend: PHP 8.4, Slim 4, REST/JSON, PDO
- DB: PostgreSQL (`pg_trgm` for typo-tolerant search)
- Hosting: Vercel (frontend, proxies `/api`), Render (backend, Docker), Neon (DB)

## Features
- **Store:** filters (platform, region, genre, price, on sale), sorting, pagination, URL-synced state
- **Search:** header autocomplete and full results; trigram similarity handles typos and partial names
- **Homepage:** blocks defined in the DB (`home_blocks`); each block fetches from its own endpoint
- **Product page:** details and offers from several sellers, sorted by price
- **Cart:** stored client-side, priced and stock-checked by the server on every view
- **Checkout:** simulated payment; keys are reserved and sold in one DB transaction (`FOR UPDATE SKIP LOCKED`), so a key is never sold twice and a declined card leaves nothing sold
- **Auth:** register/login with JWT in an httpOnly cookie; checkout and orders are protected
- **Orders:** history and purchased keys, scoped per user

## Test cards
`4242 4242 4242 4242` approves, `4000 0000 0000 0002` declines. Any future expiry, any CVC.

## Run locally
```bash
docker compose up -d
cd backend && composer install && cp .env.example .env
php migrate.php && php seed.php
php -S localhost:8080 -t public
# new terminal
cd frontend && npm install && npm run dev
```

## Decisions and scope
- Postgres instead of MySQL: free MySQL hosting is gone, and `pg_trgm` gives fuzzy search natively.
- Cart is client-side so guests and users share one code path; the server stays authoritative for prices and stock.
- Product images are generated SVG covers (no external assets); the Eneba logo is a placeholder.
- Skipped: real payment provider, email delivery of keys, seller dashboards, wishlist.