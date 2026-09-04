const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.join(__dirname, '..');

test('seed database contains core collections', () => {
  const db = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'data', 'db.json'), 'utf8'));
  for (const key of ['settings','enquiries','customers','bookings','invoices','payments','services','performers','emailTemplates','automations']) {
    assert.ok(key in db, `missing ${key}`);
  }
});

test('root index exists', () => {
  assert.ok(fs.existsSync(path.join(__dirname, '..', 'index.html')));
});

test('new booking form contains requested sections and fields', () => {
  const app = fs.readFileSync(path.join(__dirname, '..', 'assets', 'app.js'), 'utf8');
  for (const marker of [
    'DATE</label>', 'EVENT TITLE', 'ENTERTAINMENT', 'VENUE DETAILS', 'ADDRESS QUICK SEARCH',
    'VENUE NAME', 'VENUE ADDRESS', 'VENUE POSTCODE', 'VENUE TELEPHONE', 'VENUE NOTES',
    'ARRIVAL TIME', 'START TIME', 'FINISH TIME', 'No Finish Time', 'Shift Time Zone',
    'EVENT CONTACT', 'DRESS CODE', 'NO. OF GUESTS', 'OTHER SERVICES TOTAL', 'GRAND TOTAL',
    'DEPOSIT', 'PAYMENT INSTRUCTIONS'
  ]) assert.ok(app.includes(marker), `missing booking field/section: ${marker}`);
});


test('booking form layout is hard-forced to one vertical column', () => {
  const app = fs.readFileSync(path.join(root, 'assets', 'app-v1.7.js'), 'utf8');
  const start = app.indexOf("openModal(id?'Manage booking':'New booking'");
  const end = app.indexOf("'Save booking',async()=>{", start);
  assert.ok(start >= 0 && end > start);
  const block = app.slice(start, end);
  assert.ok(!block.includes('form-grid'));
  assert.ok(block.includes('display:flex!important;flex-direction:column!important'));
  for (const heading of ['EVENT DETAILS','VENUE DETAILS','TIMINGS','OTHER INFORMATION','FEES']) {
    assert.ok(block.includes(`>${heading}`));
  }
});

test('index uses versioned assets and contains critical booking layout', () => {
  const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
  assert.ok(html.includes('assets/styles-v1.7.css'));
  assert.ok(html.includes('assets/app-v1.7.js'));
  assert.ok(html.includes('booking-layout-v17'));
  assert.ok(html.includes('flex-direction:column!important'));
});
