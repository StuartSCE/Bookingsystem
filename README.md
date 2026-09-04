# EventFlow CRM v2.1

An original, white-label event-business CRM for managing enquiries, customers, events, contracts, invoices, payments, services, suppliers/team members, email templates, automation rules and availability.

This project is intentionally **not a copy of Giggio's source code, branding or proprietary UI**. It implements a comparable event-business workflow in an original codebase that you own and can modify.


## v2.1 event workflow

The CRM is now centred on the **Event** record:

1. Save the client in **Customers**.
2. Create a **New Event** and select that saved client.
3. Save the event.
4. **Generate Contract** from the Event Overview.
5. View it, download the event to your diary as `.ics`, or send the contract by email.
6. The client enters their full name and digitally accepts the contract online. The event becomes **Confirmed / Signed** and, when SMTP is configured, the business email receives a contract-signed notification.
7. Open **Invoices** and click **Generate invoice** for the event. If the event has a deposit, the CRM creates a **Deposit** invoice and a **Main** invoice for the remaining balance. If the deposit is £0, it creates only the Main invoice for the full total.
8. **Unpaid Invoices** provides Send, View, Chase, Edit, Credit Note, Bad Debt and Received actions.
9. **Received** records the payment and asks whether to send a receipt.
10. The Dashboard updates the Contract, Deposit Invoice and Main Invoice status for every upcoming event automatically.

## Fastest way to test it

### Option A — just open `index.html`

Double-click `index.html`. The CRM runs in **static demo mode** and stores edits in your browser using `localStorage`.

This means it also works on **GitHub Pages** without a backend.

### Option B — run the full stack locally

Requirements: Node.js 18+

```bash
npm install
cp .env.example .env
npm start
```

Open:

- Admin CRM: `http://localhost:3000/`
- Public enquiry form: `http://localhost:3000/enquiry.html`
- Client booking portal: `http://localhost:3000/client.html?booking=book_demo1`
- Public availability page: `http://localhost:3000/availability.html`

The backend persists data to `data/db.json`.

## GitHub testing

1. Create a new GitHub repository.
2. Upload the contents of this folder to the repository root.
3. In GitHub, open **Settings → Pages**.
4. Set Pages to deploy from the main branch/root.
5. Open the Pages URL.

On GitHub Pages the app uses browser-local storage. Every person/browser gets its own test data because GitHub Pages cannot run Node.js.

For shared real data, deploy the full Node app to a host such as Render, Railway, Fly.io, a VPS, or your own server.

## Included features

### Admin
- Dashboard with upcoming events plus live Contract / Deposit Invoice / Main Invoice status
- Enquiry pipeline
- Convert enquiry → customer + booking
- Customer CRM
- Events with dates, times, venues, packages, totals, deposits and status
- Booking statuses: Enquiry, Date Held, Contract Issued, Confirmed, Completed, Cancelled
- Contract status tracking
- Calendar view
- Event-centred invoice generation
- Deposit + Main invoice generation (or Main-only when no deposit exists)
- Unpaid invoice actions: Send, View, Chase, Edit, Credit Note, Bad Debt and Received
- Invoice numbering, payment terms, partial payments and receipt prompts
- Service/package catalogue
- Team, supplier and performer records
- Email templates with merge-field placeholders
- Automation rule configuration
- Revenue/service/source reports
- White-label business name, logo and accent colour
- VAT number, address, email, phone and booking terms
- JSON backup export

### Client-facing
- Branded web enquiry form
- Branded booking/contract portal
- Online contract signing with typed full-name digital signature
- Invoice list in client portal
- Public availability calendar

### Backend
- Express REST API
- JSON file persistence for easy ownership/portability
- Optional JWT admin authentication
- Optional SMTP email transport
- Optional Stripe Checkout session creation
- File upload endpoint for logos
- CRUD endpoints for all core records

## Important deployment note

The JSON database is deliberately simple and easy to understand. It is excellent for:

- a single small business
- prototypes
- private VPS deployments
- migrating away from a SaaS product

If you later turn this into a commercial multi-user SaaS, migrate storage to PostgreSQL and object storage. The front-end and API boundaries are already separated to make that upgrade straightforward.

## Environment variables

Copy `.env.example` to `.env`.

### Authentication

```env
AUTH_REQUIRED=true
JWT_SECRET=use-a-long-random-secret
ADMIN_EMAIL=you@example.com
ADMIN_PASSWORD=use-a-strong-password
```

The project defaults to `AUTH_REQUIRED=false` for frictionless testing. **Do not expose a production instance publicly with authentication disabled.**

### SMTP

Set these to enable real email sending:

```env
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=...
SMTP_PASS=...
SMTP_FROM=Bookings <bookings@example.com>
```

### Stripe

```env
STRIPE_SECRET_KEY=sk_...
```

The API contains a Stripe Checkout session endpoint. A Stripe webhook endpoint is included. Configure `STRIPE_WEBHOOK_SECRET` and your live `APP_URL` before taking customer payments.

## API overview

- `GET /api/health`
- `GET /api/bootstrap`
- `GET/POST /api/:collection`
- `PUT/DELETE /api/:collection/:id`
- `PUT /api/settings`
- `POST /api/enquiries/:id/convert`
- `POST /api/bookings/:id/confirm`
- `POST /api/bookings/:id/generate-invoices`
- `POST /api/bookings/:id/invoice`
- `POST /api/invoices/:id/credit-note`
- `POST /api/invoices/:id/mark-paid`
- `POST /api/public/enquiry`
- `GET /api/public/bootstrap-lite`
- `GET /api/public/booking/:id`
- `POST /api/public/booking/:id/confirm`
- `GET /api/public/availability`
- `POST /api/branding/logo`
- `POST /api/send-email`
- `POST /api/stripe/create-checkout-session`
- `POST /api/public/invoices/:id/checkout`
- `POST /api/stripe/webhook`

Core collections:

- `enquiries`
- `customers`
- `bookings`
- `invoices`
- `payments`
- `services`
- `performers`
- `emailTemplates`
- `automations`
- `documents`
- `activities`

## Folder structure

```text
.
├── index.html              # Admin SPA entry point
├── enquiry.html            # Public enquiry form
├── client.html             # Client booking/contract portal
├── availability.html       # Public availability calendar
├── server.js               # Express backend/API
├── package.json
├── .env.example
├── assets/
│   ├── app.js              # Admin application
│   └── styles.css
├── data/
│   └── db.json             # Portable persistent datastore
├── uploads/
├── tests/
│   └── smoke.test.js
└── docs/
    ├── ARCHITECTURE.md
    └── ROADMAP.md
```

## Ownership and customisation

Everything in this repository is editable. Branding is configurable in the admin settings, and you can also edit the HTML/CSS/JS directly. The code is licensed under MIT in `LICENSE`.

## Production hardening checklist

Before using this for live customer data:

1. Enable authentication.
2. Put it behind HTTPS.
3. Change `JWT_SECRET`, admin email and password.
4. Back up `data/db.json` automatically.
5. Configure SMTP if sending email.
6. Configure Stripe only after testing in Stripe test mode.
7. Register `/api/stripe/webhook` in Stripe before relying on automatic payment status.
8. Add privacy/retention policies appropriate to UK GDPR.
9. Move to PostgreSQL if you need multiple staff editing at the same time or high volume.
10. Add scheduled worker execution if you want automation rules to send messages automatically.

## Notes

The app has been designed so the static front end is usable immediately while the same UI can connect to the supplied API when hosted together. That makes it easy to iterate on GitHub first and move to a real hosted system without throwing the prototype away.


## Customer address autocomplete

The **Customers → New customer → Main Address → Quick Search** field is wired to **Ideal Postcodes Address Finder**. Start typing a UK house number, street or postcode, choose a suggestion, and the CRM fills Street 1, Street 2, Town, County, Postcode and Country.

- The project defaults to Ideal Postcodes' public test key `ak_test` for a small number of development lookups.
- For real use, create an Ideal Postcodes account and paste your `ak_...` key into **Settings → Address lookup**.
- Before going live, restrict the key's **Allowed URLs** to your GitHub Pages / staging / production domains and set sensible daily limits. Browser keys are publishable and are protected by those URL restrictions.
- Address fields always remain editable manually, so a lookup outage or exhausted balance never blocks customer creation.

The browser bundle is pinned to `@ideal-postcodes/address-finder-bundled@5` in `index.html`.


## v1.4 booking form

The New Booking form now includes Date, Event Title, Entertainment, Venue Details with address autocomplete, Timings, Other Information, and Fees. Grand Total is calculated from Fee + Other Services Total, and selecting an Entertainment service can prefill its fee and deposit. Existing bookings retain management controls for status, contract status and linked customer.


### v1.8 booking layout fix
The New Booking modal now hard-forces each major section and all of its fields into a single vertical column. Versioned asset filenames and inline critical CSS prevent stale browser-cached two-column styles from reappearing.


## v1.8 booking workflow

Saving a booking now opens a dedicated Booking Overview. Bookings use a permanent customer link (separate from Event Contact), and the overview supports contract issue/email, deposit invoice creation, booking confirmation email, payment recording including partial payments, additional services, internal notes, editing and the client portal. In static mode email actions prepare the message in the user's email application; in Node/server mode they send through configured SMTP.


## v1.9 contract portal safety

The static `index.html` / GitHub demo stores bookings in that browser only. It is therefore **not suitable for emailing live contract links to customers**. v1.9 prevents a live contract email from being prepared while the booking is only local, and provides a self-contained local contract preview instead.

For real customer contract links and automatic acceptance updates, run/deploy the Node application on a public HTTPS URL. Once the CRM is opened from that deployed server, `client.html?booking=...` retrieves the shared booking via `/api/public/booking/:id`, and accepting the contract updates the server record. A server running only on `localhost`, a private LAN IP, or a `file://` URL is intentionally treated as non-public.
