#  Apollo Lead Enrichment

> Paste a LinkedIn company URL. Get the top 5 senior decision-makers with verified emails in under 30 seconds.

Live: [helixgtm.vercel.app](https://helixgtm.vercel.app) &nbsp;|&nbsp; Stack: Next.js 14 · n8n · Apollo.io

---

## What it does

1. User enters a LinkedIn company URL (`linkedin.com/company/...`)
2. Next.js POSTs to an n8n webhook
3. n8n calls Apollo's People Search API (filtered by C-Suite, VP, Director)
4. For each of the top 5 results, n8n calls Apollo's Email Reveal API
5. Results return synchronously — names, titles, emails, phones, locations
6. User downloads a PDF report with one click

No login. No database. No polling. One URL in, five contacts out.

---

## Architecture

```
Browser
  │
  ├─ POST /api/submit (Next.js API route, 58s timeout)
  │       │
  │       └─ POST /webhook/people-lookup (n8n)
  │               │
  │               ├─ Apollo People Search  ← mixed_people/api_search
  │               │   (filter: owner/founder/c_suite/vp/director, top 10)
  │               │
  │               └─ Loop over top 5
  │                   └─ Apollo Email Reveal  ← people/match
  │                       (reveal_personal_emails: true)
  │
  └─ Response: { success, total, people[] }  ← returned directly

Browser
  └─ POST /api/pdf (Next.js, @react-pdf/renderer)
         └─ PDF streamed as attachment
```

### Why synchronous (not async with job queuing)

**First approach** — I built a 45-node async workflow: webhook fires a 202 immediately, enrichment runs in the background, results land in Google Sheets, a second status webhook lets the frontend poll every 3 seconds.

**Why it failed** — For a single company lookup (5 people, ~25 seconds total), async job tracking was pure overhead. Two n8n workflows. Two webhook URLs. A Google Sheets job store. A polling loop in the frontend. All to avoid a timeout that never actually happened at this scale.

**Better solution** — 11-node sync workflow. The webhook stays open, n8n returns the full payload when done, Next.js relays it straight to the browser. The frontend shows a spinner instead of a polling dashboard. 75% fewer nodes. One env var instead of two.

> The lesson: async job queues solve real problems at scale. At "one company at a time," they're just complexity theatre.

---

## n8n Workflow

**File:** [`n8n/04-apollo-people-lookup.json`](n8n/04-apollo-people-lookup.json)

| Node | Type | Purpose |
|---|---|---|
| Webhook | Webhook | POST `/people-lookup`, holds connection open |
| Parse Input | Code | Normalize LinkedIn URL, reset staticData |
| Apollo People Search | HTTP Request | `mixed_people/api_search` — top seniority, per_page=10 |
| Extract Top 5 | Code | Slice to 5 items, emit as individual n8n items |
| People Found? | IF | Route to error response or loop |
| Loop Over People | splitInBatches | Process 1 person at a time |
| Apollo Email Reveal | HTTP Request | `people/match` — reveal_personal_emails: true |
| Collect Result | Code | Push `{name, title, email, phone, location}` to staticData |
| Build Response | Code | Read staticData, format final array |
| Respond 200 | Respond to Webhook | Return `{ success, total, people[] }` |
| Respond 404 | Respond to Webhook | Return error if no people found |

### Import steps

1. n8n → **Workflows** → **Import from JSON** → paste `04-apollo-people-lookup.json`
2. In `Apollo People Search` and `Apollo Email Reveal` nodes: replace `YOUR_APOLLO_API_KEY` with your real key
3. Activate the workflow
4. Copy the webhook URL: `https://your-n8n.com/webhook/people-lookup`

---

## Apollo API calls used

| API | Endpoint | Purpose |
|---|---|---|
| People Search | `POST /api/v1/mixed_people/api_search` | Find senior people at a company by LinkedIn URL |
| Email Reveal | `POST /api/v1/people/match` | Reveal personal/work email per person |

Both calls use the same Apollo API key passed as `x-api-key` header.

---

## Deploy on Vercel

### 1. Fork & connect

Fork this repo → Vercel dashboard → **Add New Project** → import your fork.

### 2. Set environment variable

| Variable | Value |
|---|---|
| `N8N_WEBHOOK_URL` | `https://your-n8n.com/webhook/people-lookup` |

### 3. Deploy

Vercel auto-deploys on every push to `main`.

---

## Local development

```bash
git clone https://github.com/deenadayal77/apollo-lead-generation.git
cd apollo-lead-generation/helixgtm-enrichment
npm install

# Copy env file
cp .env.example .env.local
# Edit .env.local with your n8n URL

npm run dev
# → http://localhost:3000
```

Without `N8N_WEBHOOK_URL` set, the app runs in dev-mock mode and returns 3 fake contacts so the UI can be tested end-to-end.

---

## Project structure

```
helixgtm-enrichment/
├── app/
│   ├── page.tsx                    # Home page (server component)
│   ├── api/
│   │   ├── submit/route.ts         # POST company_url → people[]
│   │   └── pdf/route.ts            # POST people[] → PDF download
│   └── status/[jobId]/page.tsx     # Redirects to / (legacy)
├── components/
│   ├── LookupClient.tsx            # Client: form + results + PDF button
│   ├── Header.tsx
│   ├── Footer.tsx
│   └── pdf/
│       └── LeadReport.tsx          # @react-pdf/renderer document
├── lib/
│   ├── types.ts                    # Person, LookupResult types
│   └── utils.ts
└── n8n/
    ├── 01-apollo-enrichment-manual-trigger.json   # Manual trigger version
    ├── 02-apollo-enrichment-webhook.json          # Async version (legacy)
    ├── 03-status-webhook.json                     # Status poller (legacy)
    └── 04-apollo-people-lookup.json               # Current: simple sync
```

---

## What I'd add next

- [ ] Batch mode: accept multiple URLs, process in parallel, zip PDFs
- [ ] Export to CSV alongside PDF
- [ ] Cache results per company URL (TTL 24h) to avoid re-billing Apollo
- [ ] Webhook auth token so the n8n endpoint isn't publicly callable

---

## Tech choices

| Decision | Choice | Reason |
|---|---|---|
| Automation | n8n (self-hosted) | Visual debugger, no per-execution billing, easy Apollo HTTP wiring |
| Frontend | Next.js 14 App Router | API routes + React in one deploy |
| PDF | @react-pdf/renderer | Server-side, no browser dependency, dark-theme support |
| Hosting | Vercel | Zero-config Next.js, serverless API routes, free tier |
| People data | Apollo.io | Best coverage for LinkedIn-indexed companies; email reveal built-in |

---

*Built by [Deena](https://github.com/deenadayal77) — HelixGTM, 2026*
