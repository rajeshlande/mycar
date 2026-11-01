import test from 'node:test';
import assert from 'node:assert/strict';
import { moneyToPaise, moneyInput, formatMoney, sumExpenses, shiftMonth, recentMonths, validISO, localISO, filterExpenses, categoryTotals, buildReminders, csvCell, expensesCSV, distanceToKm, distanceFromKm, DEFAULT_PROFILE } from '../src/lib/logic.mjs';
import { isPublicKey, isProjectUrl } from '../src/lib/public-config.mjs';
import { makeSampleData } from '../src/lib/sample.js';

const jwt = role => `eyJhbGciOiJIUzI1NiJ9.${Buffer.from(JSON.stringify({ role })).toString('base64url')}.signature`;
test('public configuration permits only HTTPS and public keys', () => {
  assert.equal(isPublicKey(jwt('anon')), true);
  assert.equal(isPublicKey(jwt('service_role')), false);
  assert.equal(isPublicKey('sb_publishable_abcdefghijklmnop'), true);
  assert.equal(isPublicKey('sb_secret_abcdefghijklmnop'), false);
  assert.equal(isPublicKey(''), false);
  assert.equal(isProjectUrl('https://example.supabase.co'), true);
  assert.equal(isProjectUrl('http://example.supabase.co'), false);
  assert.equal(isProjectUrl('https://user:pass@example.supabase.co'), false);
  assert.equal(isProjectUrl('https://example.supabase.co?token=x'), false);
});
test('money uses exact integer paise and rejects invalid input', () => {
  assert.equal(moneyToPaise('0.29'), 29);
  assert.equal(moneyToPaise('1234.5'), 123450);
  assert.equal(moneyToPaise('9999999.99'), 999999999);
  for (const value of ['-1', '1.001', 'NaN', '1e3', '', '10000000']) assert.throws(() => moneyToPaise(value));
  assert.equal(moneyInput(123450), '1234.5');
  assert.equal(sumExpenses([{ amount_paise: 10 }, { amount_paise: 20 }]), 30);
  assert.match(formatMoney(123450), /1,234\.5/);
});
test('calendar helpers handle year boundaries and invalid dates', () => {
  assert.equal(shiftMonth('2026-01', -1), '2025-12');
  assert.equal(shiftMonth('2026-12', 1), '2027-01');
  assert.deepEqual(recentMonths('2026-03', 3), ['2026-01','2026-02','2026-03']);
  assert.equal(validISO('2024-02-29'), true);
  assert.equal(validISO('2026-02-29'), false);
  assert.equal(validISO('2026-13-01'), false);
  assert.match(localISO(new Date(2026, 0, 1)), /2026-01-01/);
});
test('filtering combines search, vehicle, category, dates and sort', () => {
  const data = makeSampleData();
  const result = filterExpenses(data.expenses, { query: 'Indian', vehicle: 'sample-creta', category: 'fuel', month: 'all', sort: 'amount' });
  assert.ok(result.length > 0);
  assert.ok(result.every(e => e.category === 'fuel' && e.vehicle_id === 'sample-creta' && e.vendor.includes('Indian')));
  assert.ok(result.every((e, i) => !i || e.amount_paise <= result[i-1].amount_paise));
  assert.equal(filterExpenses(data.expenses, { from: '2026-02-01', to: '2026-01-01' }).length, 0);
  const totals = categoryTotals(data.expenses);
  assert.equal(sumExpenses(totals.map(c => ({ amount_paise: c.amount }))), sumExpenses(data.expenses));
});
test('reminders use real dates, odometers and preference switches', () => {
  const vehicle = { id: 'v1', name: 'Car', odometer_km: 9900, insurance_expiry: '2026-11-05', service_due_date: '2026-12-01', service_due_km: 10000 };
  const reminders = buildReminders([vehicle], DEFAULT_PROFILE, '2026-11-01');
  assert.equal(reminders.length, 2);
  assert.equal(reminders.find(r => r.kind === 'insurance').days, 4);
  assert.equal(buildReminders([vehicle], { ...DEFAULT_PROFILE, reminders_enabled: false }).length, 0);
  assert.equal(buildReminders([{ ...vehicle, insurance_expiry: null, service_due_date: null, service_due_km: null }], DEFAULT_PROFILE).length, 0);
});
test('CSV quotes fields and neutralizes spreadsheet formulas', () => {
  assert.equal(csvCell('a,"b"'), '"a,""b"""');
  assert.equal(csvCell('=HYPERLINK("bad")'), '"\'=HYPERLINK(""bad"")"');
  assert.equal(csvCell(' +SUM(A1)'), '"\' +SUM(A1)"');
  assert.equal(csvCell(-12), '"-12"');
  const data = makeSampleData();
  const csv = expensesCSV(data.expenses, data.vehicles);
  assert.ok(csv.includes('Amount (INR)'));
  assert.equal(csv.split('\r\n').length, data.expenses.length + 1);
});
test('distance conversion is canonical kilometres', () => {
  assert.equal(distanceToKm('100', 'km'), 100);
  assert.equal(distanceToKm('100', 'mi'), 161);
  assert.equal(distanceFromKm(161, 'mi'), '100');
});
test('sample data is internally consistent and never has future expense dates', () => {
  const { vehicles, expenses } = makeSampleData();
  assert.equal(vehicles.filter(v => v.is_primary).length, 1);
  assert.ok(expenses.every(e => vehicles.some(v => v.id === e.vehicle_id)));
  assert.ok(expenses.every(e => e.spent_on <= localISO()));
  assert.ok(expenses.every(e => Number.isInteger(e.amount_paise) && e.amount_paise > 0));
});
