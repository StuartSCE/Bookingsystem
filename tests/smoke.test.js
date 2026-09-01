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
