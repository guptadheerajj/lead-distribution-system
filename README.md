# Lead Distribution System

A mini lead generation and provider distribution system built for the Full Stack Internship Evaluation Assignment.

The app lets customers submit service enquiries, stores them as leads in PostgreSQL, assigns each lead to exactly three eligible providers, and keeps the provider dashboard updated in real time.

## Submission Links

- GitHub Repository: https://github.com/guptadheerajj/lead-distribution-system
- Live Demo URL: `https://your-vercel-url.vercel.app`

## Tech Stack

- Next.js 16.2.6
- React 19.2.4
- TypeScript 5
- PostgreSQL
- Prisma ORM 7.8.0
- Zod 3.23.8
- Tailwind CSS 4
- Server-Sent Events for real-time dashboard updates

## Features

- Public service request form at `/request-service`
- Provider dashboard at `/dashboard`
- Test tools panel at `/test-tools`
- Database-backed lead persistence
- Database-level duplicate prevention for the same phone number and service
- Mandatory provider assignment rules per service
- Fair round-robin allocation for remaining provider slots
- Monthly quota enforcement per provider
- Serializable transactions with automatic retry for concurrent lead creation
- Idempotent quota reset via webhook simulation
- Real-time dashboard updates using Server-Sent Events

## Local Setup

1. Install dependencies:

```bash
npm install
```

2. Create a `.env` file:

```bash
DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE"
DIRECT_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE"
```

`DIRECT_URL` is optional if it is the same as `DATABASE_URL`.

3. Run database migrations:

```bash
npx prisma migrate deploy
```

For local development:

```bash
npx prisma migrate dev
```

4. Seed required services, providers, and allocation state:

```bash
npx prisma db seed
```

5. Start the development server:

```bash
npm run dev
```

6. Open the app:

```
http://localhost:3000
```

## Important Routes

| Route                           | Description                                                    |
| ------------------------------- | -------------------------------------------------------------- |
| `/`                             | Home page                                                      |
| `/request-service`              | Customer lead submission form                                  |
| `/dashboard`                    | Provider quota and lead assignment dashboard                   |
| `/test-tools`                   | Webhook and concurrency testing panel                          |
| `POST /api/leads`               | Create a single lead and trigger provider assignment           |
| `POST /api/leads/bulk`          | Generate multiple leads simultaneously for concurrency testing |
| `GET /api/providers`            | Fetch all provider data                                        |
| `GET /api/providers/updates`    | Server-Sent Events stream for real-time dashboard              |
| `POST /api/webhook/reset-quota` | Simulated payment webhook for quota reset                      |

## Seed Data

The seed script inserts:

- Services: `Service 1`, `Service 2`, `Service 3`
- Providers: `Provider 1` through `Provider 8`
- Monthly quota: `10` leads per provider
- One `AllocationState` row per service to track round-robin position

## Allocation Algorithm

Each new lead is assigned to exactly three providers.

**Mandatory provider rules:**

| Service   | Mandatory Providers    |
| --------- | ---------------------- |
| Service 1 | Provider 1             |
| Service 2 | Provider 5             |
| Service 3 | Provider 1, Provider 4 |

**Round-robin pool per service:**

| Service   | Pool                                                                   |
| --------- | ---------------------------------------------------------------------- |
| Service 1 | Provider 2, Provider 3, Provider 4                                     |
| Service 2 | Provider 6, Provider 7, Provider 8                                     |
| Service 3 | Provider 2, Provider 3, Provider 5, Provider 6, Provider 7, Provider 8 |

After mandatory providers are assigned, remaining slots are filled from the pool using round-robin. The current position is stored in the `AllocationState` table so rotation persists across server restarts.

Before assigning, the system checks quota. A provider is skipped if `leadsReceived >= monthlyQuota`. If fewer than three providers are available due to exhausted quotas, the lead creation fails and any partially created data is cleaned up.

## Concurrency Handling

All provider assignment runs inside a Prisma transaction with `Serializable` isolation level. This means when multiple leads are created simultaneously, the database forces allocation to execute one at a time — preventing two transactions from reading the same round-robin position and assigning the same provider slot.

Quota reservation uses an optimistic guard:

```typescript
await tx.provider.updateMany({
	where: { id: provider.id, leadsReceived: provider.leadsReceived },
	data: { leadsReceived: { increment: 1 } },
});
```

If another concurrent transaction already incremented `leadsReceived`, this update finds zero matching rows and skips the provider safely.

Serializable conflicts (Postgres error `P2034`) are caught and retried automatically up to three times with a short backoff delay.

## Webhook Idempotency

Quota reset is only accessible through `POST /api/webhook/reset-quota`. It is not triggerable from the customer form or provider dashboard.

Every webhook call must include an `eventId`. The system stores processed event IDs in the `WebhookEvent` table with a unique constraint:

```prisma
eventId String @unique
```

On each incoming request:

1. Check if `eventId` already exists in the table
2. If yes — return `{ message: "Already processed" }` and do nothing
3. If no — insert the `eventId`, then reset quota

A second unique constraint catch handles the race condition where two simultaneous requests with the same `eventId` both pass the initial check. Only one will succeed at the insert step.

This means calling the webhook 5 times with the same `eventId` has exactly the same effect as calling it once.

## Real-Time Dashboard

The dashboard connects to `GET /api/providers/updates` on mount using the browser's native `EventSource` API. The server keeps this connection open and pushes updated provider data every 3 seconds.

When a new lead is assigned, the dashboard:

- Updates the affected provider card automatically
- Briefly highlights the card that received a new lead
- Shows a toast notification in the bottom-right corner so off-screen updates are visible too
- Only updates the "last updated" timestamp when data actually changed

## Testing Checklist

Use `/test-tools` for the evaluation test cases:

- Reset all provider quotas through the webhook endpoint
- Call the same webhook event ID five times — confirm only the first call resets, rest return "Already processed"
- Generate 10 leads simultaneously — confirm all succeed and quota is respected
- Keep `/dashboard` open while creating leads — confirm dashboard updates without page refresh

Manual checks:

- Submit the same phone number for the same service twice — second request must be rejected
- Submit the same phone number for a different service — must be allowed
- Confirm every successful lead has exactly three provider assignments
- Confirm mandatory providers are always included when quota is available
- Confirm `leadsReceived` never exceeds `monthlyQuota`

## Useful Commands

```bash
npm run dev          # start development server
npm run build        # production build
npm run lint         # run eslint
npx prisma migrate dev      # create and apply new migration
npx prisma migrate deploy   # apply migrations in production
npx prisma db seed          # seed services, providers, allocation state
npx prisma studio           # open Prisma DB browser
```

## Project Structure

```
app/
├── api/
│   ├── leads/
│   │   ├── route.ts              # create single lead + trigger allocation
│   │   └── bulk/
│   │       └── route.ts          # create multiple leads simultaneously
│   ├── providers/
│   │   ├── route.ts              # fetch all provider data
│   │   └── updates/
│   │       └── route.ts          # SSE stream for real-time dashboard
│   └── webhook/
│       └── reset-quota/
│           └── route.ts          # idempotent quota reset webhook
├── dashboard/
│   └── page.tsx
├── request-service/
│   └── page.tsx
└── test-tools/
    └── page.tsx

lib/
├── allocate.ts                   # core allocation engine
└── prisma.ts                     # prisma client singleton

prisma/
├── schema.prisma
├── seed.ts
└── migrations/
```
