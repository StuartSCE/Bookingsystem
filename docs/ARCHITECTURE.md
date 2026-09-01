# Architecture

## Design goal

Keep the first owned version understandable, portable and inexpensive to host.

## Front end

The admin application is a no-build vanilla JavaScript SPA. It has two data modes:

1. **API mode** — if `/api/health` is reachable, records are loaded from the Node backend.
2. **Static mode** — if no backend is found, records are persisted to `localStorage`.

This is why the same `index.html` can be used both on GitHub Pages and on the full Node deployment.

## Backend

`server.js` exposes REST endpoints using Express. Records are stored in `data/db.json` and written atomically using a temporary file + rename.

This avoids native database dependencies and keeps migration simple. A later PostgreSQL repository layer can replace `readDb`/`writeDb` without requiring a redesign of the client UI.

## Data model

### Enquiry
Lead details, desired service, event date, budget, source and notes.

### Customer
Reusable client/contact record.

### Booking
The operational event record. Stores customer, service, date/time, venue, value, deposit, balance, booking status and contract status.

### Invoice
Linked to a booking/customer with invoice number, type, issue/due dates, value and payment status.

### Payment
Immutable-ish payment history linked to invoice.

### Service
Reusable package/product with price, duration and deposit percentage.

### Performer / supplier
Reusable fulfilment/team record and default fee.

### Email template / automation
Templates store reusable communication content; automation records define triggers and delays.

## Security model

Static mode is intentionally a browser-only demo and should not be used as a shared production database.

Server mode supports optional JWT auth. Production should use HTTPS, strong secrets and authenticated administration.

The public enquiry and public booking endpoints are deliberately separate from admin CRUD routes.

## Scaling path

Recommended next upgrades when needed:

- PostgreSQL + migrations
- S3-compatible object storage
- background worker / queue for emails and reminders
- Stripe webhook processing
- role-based staff accounts
- event audit log
- calendar sync (Google / Microsoft / iCal)
- e-signature evidence pack
- multi-tenant organisation IDs if sold to other businesses
