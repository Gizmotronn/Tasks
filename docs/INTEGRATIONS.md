# Integration boundaries

All six collections are append-only, owner-scoped records with `event_id` (idempotency key), `event` (versionable JSON), and server `created`. They relate to `explore_users`. Existing Explore and First Water schemas are not changed.

- `piles_events`: browser event stream: item, deposit, allocate, progress, watch. Money uses integer USD cents. Allocation is a virtual earmark. Canonical event order rejects overspending after concurrent device merges; pending offline allocations may therefore be reconciled away. Future UI should surface rejected allocations individually.
- `piles_roadmaps`: future `{roadmapId, title, source, revision, parentRevision, archived}`.
- `piles_milestones`: future `{milestoneId, roadmapId, title, evidenceCriteria, status, sourceRef}`. Rules and completion definitions await the briefing.
- `piles_reward_receipts`: future `{milestoneId, sourceEventId, evidence, recognition, firstWaterReceipt}`. Use milestone-based event IDs to deduplicate. No money creation from rewards.
- `piles_listing_sources`: future `{watchId, provider, query, constraints, enabled, lastCheckedAt, lastError}`. Credentials must live in a server secret store.
- `piles_listings`: future `{watchId, providerListingId, url, title, priceMinor, currency, condition, observedAt, expiresAt, alternativeReason}`. A provider timestamp and actual last-check state are required. Never present generated listings as observed listings.

Claude currently receives only a user-downloaded JSON brief. No API key, MCP server or paid model integration is implemented. A future authenticated MCP adapter should expose read context and proposal tools first, and use ordinary owner/scoped credentials, never PocketBase superuser credentials. Proposals need explicit acceptance before becoming allocations or milestone completions.

First Water already supports discovery and immutable completion reports. The integration must use a connection created in First Water, discover stable task IDs, and submit record-only evidence unless the owner has granted whole-task completion. Adapt the existing garden-thing/scripts/report-completion.mjs rather than injecting unknown events into its event stream. Do not equate a finance progress note to whole-task completion. This scaffold does not send reports yet.

Background listing monitoring requires a deployed scheduler and configured listing providers. The current screen stores watch requirements offline, clearly marked not monitoring. The MacBook Pro M3 Pro-or-later suggestion is a starting brief, not a scraped result.
