# Deliverability Monitoring Dashboard — Claude Code Build Spec

**Phase:** 1 (Advazon client upsell module)
**Owner:** Rakib / Advazon
**Goal:** Automate what Advazon currently does manually — DNS/deliverability checks — into a monitoring product existing clients can subscribe to.

---

## 1. Product Scope

A dashboard + alert system that continuously checks a client's sending domain(s) and surfaces problems before they hurt inbox placement.

### Monitors (all required)
1. **SPF status** — record present, valid, no more than 10 DNS lookups (RFC limit)
2. **DKIM status** — selector found, valid signature, key strength
3. **DMARC status** — policy present (none/quarantine/reject), alignment mode, reporting addresses
4. **Inbox placement score** — % landing in inbox vs spam vs missing, tested across major providers (Gmail, Outlook, Yahoo)
5. **Domain reputation** — blacklist status (Spamhaus, Barracuda, etc.), sender score if available
6. **Warmup progress** — sending volume ramp vs safe threshold, bounce rate, spam complaint rate trend

### Alerts
- Triggered on: any monitor dropping below threshold, or status change (e.g. DKIM broken, domain blacklisted)
- Delivered via **email** (immediate) and **dashboard** (persistent log + current state)
- Severity levels: critical (blacklisted, DKIM broken) vs warning (score dip, reputation trending down)

---

## 2. Architecture

Reuse the **queen + workers** pattern from the existing agentic outbound system rather than building from scratch.

```
┌─────────────────────────────────────────┐
│              QUEEN AGENT                 │
│   Schedules checks, aggregates results,  │
│   decides alert severity, writes to DB   │
└───────────────┬───────────────────────────┘
                 │
    ┌────────────┼────────────┬────────────┬─────────────┐
    ▼            ▼            ▼            ▼             ▼
┌────────┐  ┌────────┐  ┌──────────┐ ┌──────────┐ ┌───────────┐
│ SPF/   │  │Inbox   │  │ Domain   │ │ Warmup   │ │  Alert    │
│ DKIM/  │  │Placement│ │Reputation│ │ Tracker  │ │  Dispatch │
│ DMARC  │  │ Worker  │  │ Worker   │ │ Worker   │ │  Worker   │
│ Worker │  │        │  │          │ │          │ │           │
└────────┘  └────────┘  └──────────┘ └──────────┘ └───────────┘
```

Each worker runs independently on a schedule, writes results to Postgres, and the queen decides if a client-facing alert should fire (avoids duplicate/noisy alerts).

---

## 3. Data Sources / Tools per Worker

| Worker | How it checks | Notes |
|---|---|---|
| SPF/DKIM/DMARC | DNS TXT lookups (Node `dns` module or a DNS API) | No third-party API needed — pure DNS queries |
| Inbox Placement | Seed-list test (send to test inboxes across providers, check placement) | May need a third-party API (e.g. GlockApps API) if building seed-list infra in-house is too slow for MVP |
| Domain Reputation | Query public blacklist DBs (Spamhaus, Barracuda) + sender score APIs | Some offer free lookup APIs |
| Warmup Tracker | Pull from whatever ESP/warmup tool client uses (Instantly, Smartlead API) OR track via client's own sending logs if accessible | Needs API access per client's stack |
| Alert Dispatch | Internal — reads queen's decision, sends via Resend/SendGrid (email) + writes to dashboard DB table | |

---

## 4. Stack (MVP)

- **Frontend/Dashboard:** Next.js on Vercel — client-facing view of current status + alert history
- **Backend/Orchestration:** FastAPI (Python) on Railway/Render — hosts queen + worker logic, runs on schedule (cron)
- **Database:** Supabase (Postgres) — stores check results, client domains, alert log
- **Email delivery:** Resend or SendGrid — alert emails
- **Auth:** Supabase Auth — client login to see their own domain(s) only

---

## 5. Build Order (suggested for Claude Code sessions)

1. **DB schema** — clients, domains, check_results, alerts tables
2. **SPF/DKIM/DMARC worker** — simplest, no external API, build and test first
3. **Queen agent logic** — scheduling + alert decision rules
4. **Alert dispatch worker** — email + dashboard write
5. **Dashboard UI** — read-only status view first, polish later
6. **Domain reputation worker** — blacklist checks
7. **Warmup tracker worker** — needs API research per ESP client uses
8. **Inbox placement worker** — most complex, likely needs third-party API; can be added last or manually run initially

This order gets a working alert loop (steps 1–4) live fastest — the highest-value part for an upsell demo.

---

## 6. Open Decisions Before Building

- Which ESPs/warmup tools do current clients use? (determines what APIs the warmup worker needs)
- Build inbox placement testing in-house or use a third-party API for MVP speed?
- Per-client domain limit for MVP (e.g. 1–3 domains per subscription tier)?
