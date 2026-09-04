require('dotenv').config();
const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const multer = require('multer');
const nodemailer = require('nodemailer');
const Stripe = require('stripe');

const app = express();
const PORT = Number(process.env.PORT || 3000);
const ROOT = __dirname;
const DB_PATH = path.join(ROOT, 'data', 'db.json');
const UPLOAD_DIR = path.join(ROOT, 'uploads');
const COLLECTIONS = new Set([
  'enquiries', 'customers', 'bookings', 'invoices', 'payments', 'services',
  'performers', 'emailTemplates', 'automations', 'documents', 'activities'
]);

fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });
fs.mkdirSync(UPLOAD_DIR, { recursive: true });

app.use(cors());

// Stripe needs the untouched request body to verify webhook signatures.
app.post('/api/stripe/webhook', express.raw({ type: 'application/json' }), (req, res) => {
  if (!process.env.STRIPE_SECRET_KEY || !process.env.STRIPE_WEBHOOK_SECRET) {
    return res.status(501).json({ error: 'Stripe webhook is not configured.' });
  }
  try {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    const event = stripe.webhooks.constructEvent(req.body, req.headers['stripe-signature'], process.env.STRIPE_WEBHOOK_SECRET);
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      const invoiceId = session.metadata?.invoiceId;
      if (invoiceId) {
        const db = readDb();
        const invoice = (db.invoices || []).find(x => x.id === invoiceId);
        if (invoice && invoice.status !== 'Paid') {
          invoice.status = 'Paid';
          invoice.paidAt = now();
          db.payments.unshift({
            id: id('pay'), createdAt: now(), invoiceId: invoice.id, invoiceNumber: invoice.number,
            customerName: invoice.customerName, amount: Number(session.amount_total || 0) / 100,
            method: 'Stripe', reference: session.payment_intent || session.id, date: today()
          });
          activity(db, 'payment', `${invoice.number} paid via Stripe`);
          writeDb(db);
        }
      }
    }
    res.json({ received: true });
  } catch (err) {
    res.status(400).send(`Webhook error: ${err.message}`);
  }
});

app.use(express.json({ limit: '8mb' }));
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(UPLOAD_DIR));

const id = (prefix = 'id') => `${prefix}_${crypto.randomUUID().replaceAll('-', '').slice(0, 16)}`;
const now = () => new Date().toISOString();
const today = () => new Date().toISOString().slice(0, 10);

function readDb() {
  return JSON.parse(fs.readFileSync(DB_PATH, 'utf8'));
}

function writeDb(db) {
  const temp = `${DB_PATH}.tmp`;
  fs.writeFileSync(temp, JSON.stringify(db, null, 2));
  fs.renameSync(temp, DB_PATH);
}

function activity(db, type, text) {
  db.activities ||= [];
  db.activities.unshift({ id: id('act'), createdAt: now(), type, text });
  db.activities = db.activities.slice(0, 250);
}

function authRequired() {
  return String(process.env.AUTH_REQUIRED || 'false').toLowerCase() === 'true';
}

function authMiddleware(req, res, next) {
  if (!authRequired()) return next();
  if (req.path === '/health' || req.path === '/auth/login' || req.path.startsWith('/public/')) return next();
  const token = (req.headers.authorization || '').replace(/^Bearer\s+/i, '');
  if (!token) return res.status(401).json({ error: 'Authentication required' });
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET || 'development-only-secret');
    next();
  } catch {
    res.status(401).json({ error: 'Invalid or expired token' });
  }
}

app.post('/api/auth/login', async (req, res) => {
  const email = String(req.body.email || '').trim().toLowerCase();
  const password = String(req.body.password || '');
  const adminEmail = String(process.env.ADMIN_EMAIL || 'admin@example.com').toLowerCase();
  const configuredPassword = process.env.ADMIN_PASSWORD || 'change-me';
  const passwordOk = process.env.ADMIN_PASSWORD_HASH
    ? await bcrypt.compare(password, process.env.ADMIN_PASSWORD_HASH)
    : password === configuredPassword;
  const ok = email === adminEmail && passwordOk;
  if (!ok) return res.status(401).json({ error: 'Incorrect email or password' });
  const token = jwt.sign({ email }, process.env.JWT_SECRET || 'development-only-secret', { expiresIn: '12h' });
  res.json({ token, email });
});

app.use('/api', authMiddleware);

app.get('/api/health', (req, res) => {
  res.json({ ok: true, app: 'EventFlow CRM', version: '1.8.0', authRequired: authRequired() });
});

app.get('/api/bootstrap', (req, res) => {
  res.json(readDb());
});

app.get('/api/settings', (req, res) => res.json(readDb().settings || {}));
app.put('/api/settings', (req, res) => {
  const db = readDb();
  db.settings = { ...db.settings, ...req.body };
  activity(db, 'settings', 'Business settings updated');
  writeDb(db);
  res.json(db.settings);
});

app.get('/api/:collection', (req, res, next) => {
  const { collection } = req.params;
  if (!COLLECTIONS.has(collection)) return next();
  const db = readDb();
  let items = db[collection] || [];
  const q = String(req.query.q || '').trim().toLowerCase();
  if (q) items = items.filter(x => JSON.stringify(x).toLowerCase().includes(q));
  res.json(items);
});

app.post('/api/:collection', (req, res, next) => {
  const { collection } = req.params;
  if (!COLLECTIONS.has(collection)) return next();
  const db = readDb();
  db[collection] ||= [];
  const item = { id: req.body.id || id(collection.slice(0, 4)), createdAt: req.body.createdAt || now(), ...req.body };
  db[collection].unshift(item);
  activity(db, collection, `${collection.replace(/([A-Z])/g, ' $1')} record created`);
  writeDb(db);
  res.status(201).json(item);
});

app.put('/api/:collection/:recordId', (req, res, next) => {
  const { collection, recordId } = req.params;
  if (!COLLECTIONS.has(collection)) return next();
  const db = readDb();
  const list = db[collection] || [];
  const index = list.findIndex(x => x.id === recordId);
  if (index < 0) return res.status(404).json({ error: 'Record not found' });
  list[index] = { ...list[index], ...req.body, id: recordId, updatedAt: now() };
  activity(db, collection, `${collection.replace(/([A-Z])/g, ' $1')} record updated`);
  writeDb(db);
  res.json(list[index]);
});

app.delete('/api/:collection/:recordId', (req, res, next) => {
  const { collection, recordId } = req.params;
  if (!COLLECTIONS.has(collection)) return next();
  const db = readDb();
  const before = (db[collection] || []).length;
  db[collection] = (db[collection] || []).filter(x => x.id !== recordId);
  if (db[collection].length === before) return res.status(404).json({ error: 'Record not found' });
  activity(db, collection, `${collection.replace(/([A-Z])/g, ' $1')} record deleted`);
  writeDb(db);
  res.status(204).end();
});

app.post('/api/enquiries/:recordId/convert', (req, res) => {
  const db = readDb();
  const enquiry = (db.enquiries || []).find(x => x.id === req.params.recordId);
  if (!enquiry) return res.status(404).json({ error: 'Enquiry not found' });

  let customer = (db.customers || []).find(x => String(x.email).toLowerCase() === String(enquiry.email).toLowerCase());
  if (!customer) {
    customer = {
      id: id('cus'), createdAt: now(), name: enquiry.name, company: '', email: enquiry.email,
      phone: enquiry.phone || '', address: '', source: enquiry.source || '', notes: enquiry.notes || ''
    };
    db.customers.unshift(customer);
  }

  const service = (db.services || []).find(x => x.name === enquiry.service);
  const total = Number(req.body.total ?? enquiry.budget ?? service?.price ?? 0);
  const depositPercent = Number(service?.depositPercent ?? db.settings.defaultDepositPercent ?? 25);
  const booking = {
    id: id('book'), createdAt: now(), customerId: customer.id, customerName: customer.name,
    title: req.body.title || `${enquiry.eventType || 'Event'} - ${enquiry.name}`,
    eventType: enquiry.eventType || 'Event', eventDate: enquiry.eventDate || '', startTime: req.body.startTime || '',
    endTime: req.body.endTime || '', venue: enquiry.venue || '', serviceId: service?.id || '',
    serviceName: enquiry.service || service?.name || '', status: 'Date Held', contractStatus: 'Draft',
    total, deposit: Math.round(total * depositPercent) / 100, balance: Math.round(total * (100 - depositPercent)) / 100,
    notes: enquiry.notes || '', assignedPerformerIds: []
  };
  db.bookings.unshift(booking);
  enquiry.status = 'Converted';
  enquiry.convertedBookingId = booking.id;
  activity(db, 'booking', `Enquiry converted to booking: ${booking.title}`);
  writeDb(db);
  res.status(201).json({ customer, booking });
});

app.post('/api/bookings/:recordId/confirm', (req, res) => {
  const db = readDb();
  const booking = (db.bookings || []).find(x => x.id === req.params.recordId);
  if (!booking) return res.status(404).json({ error: 'Booking not found' });
  booking.status = 'Confirmed';
  booking.contractStatus = 'Accepted';
  booking.contractAcceptedAt = now();
  booking.contractAcceptedBy = req.body.name || booking.customerName;
  booking.contractAcceptedIp = req.ip;
  activity(db, 'contract', `Contract accepted for ${booking.title}`);
  writeDb(db);
  res.json(booking);
});

app.post('/api/bookings/:recordId/invoice', (req, res) => {
  const db = readDb();
  const booking = (db.bookings || []).find(x => x.id === req.params.recordId);
  if (!booking) return res.status(404).json({ error: 'Booking not found' });
  const type = req.body.type || 'Balance';
  const amount = Number(req.body.amount ?? (type === 'Deposit' ? booking.deposit : booking.balance));
  const issue = req.body.issueDate || today();
  const due = new Date(`${issue}T12:00:00`);
  due.setDate(due.getDate() + Number(db.settings.paymentTermsDays || 14));
  const number = `${db.settings.invoicePrefix || 'INV-'}${db.settings.nextInvoiceNumber || 1}`;
  db.settings.nextInvoiceNumber = Number(db.settings.nextInvoiceNumber || 1) + 1;
  const invoice = {
    id: id('inv'), createdAt: now(), number, bookingId: booking.id, customerId: booking.customerId,
    customerName: booking.customerName, type, issueDate: issue, dueDate: due.toISOString().slice(0, 10), amount,
    status: 'Draft', paidAt: null, description: req.body.description || `${type} - ${booking.title}`
  };
  db.invoices.unshift(invoice);
  activity(db, 'invoice', `Invoice ${number} created`);
  writeDb(db);
  res.status(201).json(invoice);
});

app.post('/api/invoices/:recordId/mark-paid', (req, res) => {
  const db = readDb();
  const invoice = (db.invoices || []).find(x => x.id === req.params.recordId);
  if (!invoice) return res.status(404).json({ error: 'Invoice not found' });
  const alreadyPaid = (db.payments || []).filter(p => p.invoiceId === invoice.id).reduce((sum,p) => sum + Number(p.amount || 0), 0);
  const remaining = Math.max(0, Number(invoice.amount || 0) - alreadyPaid);
  const amount = Number(req.body.amount ?? remaining);
  if (!Number.isFinite(amount) || amount <= 0) return res.status(400).json({ error: 'Payment amount must be greater than zero' });
  if (amount > remaining + 0.005) return res.status(400).json({ error: `Payment exceeds the remaining invoice balance (${remaining.toFixed(2)})` });
  const payment = {
    id: id('pay'), createdAt: now(), invoiceId: invoice.id, invoiceNumber: invoice.number,
    customerName: invoice.customerName, amount,
    method: req.body.method || 'Bank transfer', reference: req.body.reference || '', date: req.body.date || today()
  };
  db.payments.unshift(payment);
  const paidTotal = alreadyPaid + amount;
  invoice.paidAmount = paidTotal;
  invoice.status = paidTotal + 0.005 >= Number(invoice.amount || 0) ? 'Paid' : 'Part Paid';
  invoice.paidAt = invoice.status === 'Paid' ? now() : null;
  activity(db, 'payment', `${amount.toFixed(2)} recorded against ${invoice.number}`);
  writeDb(db);
  res.json({ invoice, payment, paidTotal, remaining: Math.max(0, Number(invoice.amount || 0) - paidTotal) });
});


app.get('/api/public/bootstrap-lite', (req, res) => {
  const db = readDb();
  res.json({ settings: db.settings || {}, services: (db.services || []).filter(x => x.active !== false) });
});

app.get('/api/public/booking/:recordId', (req, res) => {
  const db = readDb();
  const booking = (db.bookings || []).find(x => x.id === req.params.recordId);
  if (!booking) return res.status(404).json({ error: 'Booking not found' });
  const customer = (db.customers || []).find(x => x.id === booking.customerId);
  const invoices = (db.invoices || []).filter(x => x.bookingId === booking.id);
  res.json({ settings: db.settings || {}, booking, customer: customer ? { name: customer.name, email: customer.email } : null, invoices });
});


app.post('/api/public/invoices/:recordId/checkout', async (req, res) => {
  if (!process.env.STRIPE_SECRET_KEY) return res.status(501).json({ error: 'Stripe is not configured.' });
  const db = readDb();
  const invoice = (db.invoices || []).find(x => x.id === req.params.recordId);
  if (!invoice) return res.status(404).json({ error: 'Invoice not found' });
  if (invoice.status === 'Paid') return res.status(400).json({ error: 'Invoice is already paid' });
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  const appUrl = process.env.APP_URL || `http://localhost:${PORT}`;
  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    line_items: [{
      price_data: {
        currency: String(db.settings.currency || 'GBP').toLowerCase(),
        unit_amount: Math.round(Number(invoice.amount) * 100),
        product_data: { name: invoice.description || invoice.number }
      },
      quantity: 1
    }],
    metadata: { invoiceId: invoice.id, invoiceNumber: invoice.number },
    success_url: `${appUrl}/client.html?booking=${encodeURIComponent(invoice.bookingId)}&paid=1`,
    cancel_url: `${appUrl}/client.html?booking=${encodeURIComponent(invoice.bookingId)}&cancelled=1`
  });
  res.json({ url: session.url });
});

app.post('/api/public/booking/:recordId/confirm', (req, res) => {
  const db = readDb();
  const booking = (db.bookings || []).find(x => x.id === req.params.recordId);
  if (!booking) return res.status(404).json({ error: 'Booking not found' });
  booking.status = 'Confirmed';
  booking.contractStatus = 'Accepted';
  booking.contractAcceptedAt = now();
  booking.contractAcceptedBy = req.body.name || booking.customerName;
  booking.contractAcceptedIp = req.ip;
  activity(db, 'contract', `Contract accepted for ${booking.title}`);
  writeDb(db);
  res.json({ ok: true, booking });
});

app.get('/api/public/availability', (req, res) => {
  const db = readDb();
  const from = req.query.from || '0000-01-01';
  const to = req.query.to || '9999-12-31';
  const items = (db.bookings || [])
    .filter(x => x.eventDate >= from && x.eventDate <= to && x.status !== 'Cancelled')
    .map(x => ({ date: x.eventDate, status: x.status, title: req.query.hideDetails === 'false' ? x.title : 'Booked' }));
  res.json({ settings: db.settings || {}, items });
});

app.post('/api/public/enquiry', (req, res) => {
  const db = readDb();
  const item = {
    id: id('enq'), createdAt: now(), status: 'New', name: req.body.name || '', email: req.body.email || '',
    phone: req.body.phone || '', eventDate: req.body.eventDate || '', eventType: req.body.eventType || '',
    venue: req.body.venue || '', service: req.body.service || '', budget: Number(req.body.budget || 0),
    source: req.body.source || 'Website', notes: req.body.notes || ''
  };
  db.enquiries.unshift(item);
  activity(db, 'enquiry', `New web enquiry from ${item.name || item.email}`);
  writeDb(db);
  res.status(201).json({ ok: true, enquiry: item, message: db.settings.enquiryThankYou });
});

const upload = multer({
  storage: multer.diskStorage({
    destination: UPLOAD_DIR,
    filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname.replace(/[^a-zA-Z0-9._-]/g, '-')}`)
  }),
  limits: { fileSize: 5 * 1024 * 1024 }
});

app.post('/api/branding/logo', upload.single('logo'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No logo uploaded' });
  const db = readDb();
  db.settings.logoUrl = `/uploads/${req.file.filename}`;
  writeDb(db);
  res.json({ logoUrl: db.settings.logoUrl });
});

app.post('/api/send-email', async (req, res) => {
  if (!process.env.SMTP_HOST) return res.status(501).json({ error: 'SMTP is not configured. Add SMTP_* values to .env.' });
  const transport = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: String(process.env.SMTP_SECURE || 'false') === 'true',
    auth: process.env.SMTP_USER ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS } : undefined
  });
  const info = await transport.sendMail({
    from: process.env.SMTP_FROM || process.env.SMTP_USER,
    to: req.body.to,
    subject: req.body.subject,
    text: req.body.text,
    html: req.body.html
  });
  res.json({ ok: true, messageId: info.messageId });
});

app.post('/api/stripe/create-checkout-session', async (req, res) => {
  if (!process.env.STRIPE_SECRET_KEY) return res.status(501).json({ error: 'Stripe is not configured.' });
  const db = readDb();
  const invoice = (db.invoices || []).find(x => x.id === req.body.invoiceId);
  if (!invoice) return res.status(404).json({ error: 'Invoice not found' });
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  const appUrl = process.env.APP_URL || `http://localhost:${PORT}`;
  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    line_items: [{
      price_data: {
        currency: String(db.settings.currency || 'GBP').toLowerCase(),
        unit_amount: Math.round(Number(invoice.amount) * 100),
        product_data: { name: invoice.description || invoice.number }
      },
      quantity: 1
    }],
    metadata: { invoiceId: invoice.id, invoiceNumber: invoice.number },
    success_url: `${appUrl}/client.html?invoice=${encodeURIComponent(invoice.id)}&paid=1`,
    cancel_url: `${appUrl}/client.html?invoice=${encodeURIComponent(invoice.id)}&cancelled=1`
  });
  res.json({ url: session.url });
});

app.get('/api/availability', (req, res) => {
  const db = readDb();
  const from = req.query.from || '0000-01-01';
  const to = req.query.to || '9999-12-31';
  const items = (db.bookings || [])
    .filter(x => x.eventDate >= from && x.eventDate <= to && x.status !== 'Cancelled')
    .map(x => ({ date: x.eventDate, status: x.status, title: req.query.hideDetails === 'true' ? 'Booked' : x.title }));
  res.json(items);
});

app.use(express.static(ROOT, { extensions: ['html'] }));

app.get('*', (req, res) => {
  if (req.path.startsWith('/api/')) return res.status(404).json({ error: 'API route not found' });
  res.sendFile(path.join(ROOT, 'index.html'));
});

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: err.message || 'Unexpected server error' });
});

app.listen(PORT, () => {
  console.log(`EventFlow CRM running at http://localhost:${PORT}`);
  console.log(`Data file: ${DB_PATH}`);
  if (!authRequired()) console.log('AUTH_REQUIRED=false (demo mode). Enable auth before production use.');
});
