const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.join(__dirname, '..');
const app = () => fs.readFileSync(path.join(root,'assets','app-v2.1.js'),'utf8');

test('seed database contains core CRM collections', () => {
  const db = JSON.parse(fs.readFileSync(path.join(root, 'data', 'db.json'), 'utf8'));
  for (const key of ['settings','enquiries','customers','bookings','invoices','payments','services','performers','emailTemplates','automations','documents']) assert.ok(key in db, `missing ${key}`);
});

test('v2.1 index uses cache-busted assets and Events wording', () => {
  const html=fs.readFileSync(path.join(root,'index.html'),'utf8');
  assert.ok(html.includes('assets/styles-v2.1.css'));
  assert.ok(html.includes('assets/app-v2.1.js'));
  assert.match(html, /> Events<\/button>/);
  assert.ok(html.includes('＋ New event'));
});

test('new event permanently links a saved customer and keeps the requested event sections', () => {
  const src=app();
  for(const marker of ['bCustomerSearch','bCustomerId','EVENT DETAILS','VENUE DETAILS','TIMINGS','OTHER INFORMATION','FEES','EVENT CONTACT','PAYMENT INSTRUCTIONS']) assert.ok(src.includes(marker),`missing ${marker}`);
  assert.ok(src.includes('Choose an existing customer before saving the event'));
  assert.ok(src.includes("openModal(id?'Edit event':'New event'"));
});

test('event overview follows contract-first workflow', () => {
  const src=app();
  for(const action of ['generateContract','viewContract','sendContract','addDiary','openInvoices','bookingEdit']) assert.ok(src.includes(`id="${action}"`)||src.includes(`$('#${action}')`),`missing ${action}`);
  assert.ok(src.includes('Generate the contract first'));
  assert.ok(!src.includes('id="depositInvoice"'), 'event overview should not directly create a deposit invoice');
});

test('dashboard shows live contract, deposit and main invoice status', () => {
  const src=app();
  assert.ok(src.includes("eventContractLabel(b)"));
  assert.ok(src.includes("eventInvoiceLabel(b,'Deposit')"));
  assert.ok(src.includes("eventInvoiceLabel(b,'Main')"));
  assert.ok(src.includes('Upcoming events'));
});

test('invoice page has event generation and full unpaid invoice actions', () => {
  const src=app();
  assert.ok(src.includes('generateEventInvoices'));
  for(const label of ['Unpaid invoices','Send','View','Chase','Edit','Credit note','Bad debt','Received']) assert.ok(src.includes(label),`missing ${label}`);
  assert.ok(src.includes("make('Deposit'"));
  assert.ok(src.includes("make('Main'"));
  assert.ok(src.includes('Yes — send receipt'));
});

test('server supports atomic invoice generation, credit notes and partial payments', () => {
  const server=fs.readFileSync(path.join(root,'server.js'),'utf8');
  assert.ok(server.includes("/api/bookings/:recordId/generate-invoices"));
  assert.ok(server.includes("/api/invoices/:recordId/credit-note"));
  assert.ok(server.includes("'Part Paid'"));
  assert.ok(server.includes('Payment exceeds the remaining invoice balance'));
  assert.ok(server.includes("make('Main'"));
});

test('digital contract signing records signer and triggers admin notification email when SMTP is configured', () => {
  const client=fs.readFileSync(path.join(root,'client.html'),'utf8');
  const server=fs.readFileSync(path.join(root,'server.js'),'utf8');
  assert.ok(client.includes('id="signName"'));
  assert.ok(client.includes('FULL NAME / DIGITAL SIGNATURE'));
  assert.ok(server.includes('Contract signed – ${booking.title}'));
  assert.ok(server.includes('contractSignedNotificationSentAt'));
  assert.ok(server.includes("contract.status = 'Accepted'"));
});
