# Tasks · Piles

Minimal Things-inspired finance and travel PWA scaffold. Plain browser modules, no frontend dependencies. Run `npm start` from this directory and open http://localhost:5173. HTTPS is required for installed/offline use outside localhost.

Wishlist and travel targets include priority, target amount, deadline and notes. The Today page suggests weekly earmarks from an available spend pile, caps recommendations to available cash, and flags weekly shortfalls. USD is the current currency. This is planning, not bank integration. No real balances or sample purchases are fabricated. Add money and wishes to begin.

IndexedDB commits events before confirmation. The service worker caches the shell after one online visit. Shared Explore-account sync uploads immutable owner-scoped events, merges other devices, and retains local work on failure. An account-bound device refuses another account. Tokens are stored on the personal device; passwords are not retained. Export backup and Claude brief are available in Settings. Backup restore UI is not implemented yet. Browser eviction can remove local data.

Progress records recognise self-reported milestones and challenging personal steps without minting money. Saved second-hand search requirements, roadmap storage, First Water delivery, scheduled listing ingestion and Claude/MCP adapters are scaffolding, not live integrations. See docs/INTEGRATIONS.md for boundaries and proposed payloads.

## PocketBase

`python3 scripts/schema.py` creates only six new collections, using configured POCKETBASE_URL, POCKETBASE_SUPERUSER_EMAIL and POCKETBASE_SUPERUSER_PASSWORD. Credentials are never written to files. `python3 scripts/schema.py --offline` writes portable schemas only. Existing matching collections are checked for permissions; mismatches stop installation. Portable JSON uses EXPLORE_USERS_ID as a placeholder. All six collections were created and verified on 2026-11-06. The initial Cloudflare 403 / error 1010 was caused by Python’s default User-Agent; the installer now sends an explicit Tasks-Piles/1.0 identifier. The service’s security settings were not weakened.

## Checks and limits

`npm test` checks recommendation bounds, competing offline allocations, idempotent replay, no money creation from progress, and undated targets. Browser and installed-device validation remain outstanding. The frontend is deployed at https://tasks-piles.liam-55d.workers.dev; all shell asset endpoints were verified over HTTPS. Ordinary-owner collection reads and anonymous filtering were checked against production without creating user records. Future work includes editable/archive flows, restore, conflict notices, provider ingestion, secure MCP access, and milestone reward definitions after the full briefing.

## Cloudflare deployment

`python3 scripts/deploy.py` publishes the public assets to the `tasks-piles` Worker using CLOUDFLARE_API_TOKEN. The account and URL are retained in cloudflare.json. The script bundles static assets, applies security headers, and enables the workers.dev route. It never bundles secrets or local user data. Re-run after frontend changes. The public frontend stores personal data on-device and uses owner-authenticated PocketBase sync.
