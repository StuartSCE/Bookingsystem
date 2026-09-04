const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.join(__dirname, '..');

test('seed database contains core collections', () => {
  const db = JSON.parse(fs.readFileSync(path.join(root, 'data', 'db.json'), 'utf8'));
  for (const key of ['settings','enquiries','customers','bookings','invoices','payments','services','performers','emailTemplates','automations','documents']) assert.ok(key in db, `missing ${key}`);
});

test('root index exists and uses v1.9 assets', () => {
  const html=fs.readFileSync(path.join(root,'index.html'),'utf8');
  assert.ok(html.includes('assets/styles-v1.9.css'));
  assert.ok(html.includes('assets/app-v1.9.js'));
  assert.ok(html.includes('booking-layout-v19'));
});

test('new booking has permanent customer selector and requested sections', () => {
  const app=fs.readFileSync(path.join(root,'assets','app-v1.9.js'),'utf8');
  for(const marker of ['bCustomerSearch','bCustomerId','EVENT DETAILS','VENUE DETAILS','TIMINGS','OTHER INFORMATION','FEES','EVENT CONTACT','PAYMENT INSTRUCTIONS']) assert.ok(app.includes(marker),`missing ${marker}`);
  assert.ok(app.includes("Choose an existing customer before saving the booking"));
});

test('booking form remains hard single-column', () => {
  const app=fs.readFileSync(path.join(root,'assets','app-v1.9.js'),'utf8');
  const start=app.indexOf("openModal(id?'Edit booking':'New booking'");
  const end=app.indexOf("'Save booking',async()=>{",start);
  assert.ok(start>=0&&end>start);
  const block=app.slice(start,end);
  assert.ok(!block.includes('form-grid'));
  assert.ok(block.includes('flex-direction:column!important'));
});

test('saving a booking navigates to Booking Overview', () => {
  const app=fs.readFileSync(path.join(root,'assets','app-v1.9.js'),'utf8');
  assert.ok(app.includes('navigateBooking(saved.id)'));
  assert.ok(app.includes('function renderBookingOverview(id)'));
  for(const action of ['sendContract','depositInvoice','sendConfirmation','recordBookingPayment','addBookingService','addBookingNote','bookingEdit']) assert.ok(app.includes(`id="${action}"`)||app.includes(`'#${action}'`)||app.includes(`$('#${action}')`),`missing action ${action}`);
});

test('payments support partial invoice payments', () => {
  const server=fs.readFileSync(path.join(root,'server.js'),'utf8');
  assert.ok(server.includes("'Part Paid'"));
  assert.ok(server.includes('paidTotal'));
  assert.ok(server.includes('Payment exceeds the remaining invoice balance'));
});


test('v1.9 static contract links use a snapshot preview and live contract email is guarded', () => {
  const app = fs.readFileSync(path.join(root, 'assets', 'app-v1.9.js'), 'utf8');
  const client = fs.readFileSync(path.join(root, 'client.html'), 'utf8');
  assert.match(app, /encodePortalSnapshot/);
  assert.match(app, /portalIsExternallyReachable/);
  assert.match(app, /Do not email this contract link to a customer yet/);
  assert.match(client, /decodeSnapshot/);
  assert.match(client, /Local preview only/);
});
