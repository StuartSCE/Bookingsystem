const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

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
