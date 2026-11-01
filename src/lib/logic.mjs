export const CATEGORIES = [
  { id: 'fuel', label: 'Fuel', color: '#398366', tint: '#eaf4ee', icon: 'Fuel' },
  { id: 'service', label: 'Service & repairs', color: '#dd9b54', tint: '#fcf1e5', icon: 'Wrench' },
  { id: 'insurance', label: 'Insurance', color: '#7896bc', tint: '#edf2f9', icon: 'ShieldCheck' },
  { id: 'parking', label: 'Parking', color: '#a18ac1', tint: '#f2edf8', icon: 'SquareParking' },
  { id: 'tolls', label: 'Tolls & FASTag', color: '#d6be72', tint: '#f8f4e6', icon: 'Route' },
  { id: 'other', label: 'Other', color: '#a6b4ad', tint: '#eff2f0', icon: 'Receipt' },
];
export const categoryFor = id => CATEGORIES.find(c => c.id === id) || CATEGORIES.at(-1);
export const FUEL_TYPES = ['Petrol', 'Diesel', 'CNG', 'Electric', 'Hybrid'];
export const BODY_TYPES = ['SUV', 'Hatchback', 'Sedan', 'MPV', 'Other'];
export const VEHICLE_COLORS = [
  { id: 'silver', label: 'Silver', hex: '#b8c2c0' },
  { id: 'white', label: 'White', hex: '#f4f3ec' },
  { id: 'black', label: 'Black', hex: '#303a36' },
  { id: 'blue', label: 'Blue', hex: '#6d91b1' },
  { id: 'red', label: 'Red', hex: '#bb6a60' },
  { id: 'green', label: 'Green', hex: '#577e68' },
];
export const DEFAULT_PROFILE = {
  full_name: '', phone: '', city: '', bio: '', currency: 'INR', distance_unit: 'km',
  monthly_budget_paise: 0, reminders_enabled: true, reminder_days: 30, theme: 'system',
};
export function localISO(date = new Date()) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}
export function validISO(value) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const d = new Date(`${value}T12:00:00Z`);
  return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === value;
}
export function currentMonth() { return localISO().slice(0, 7); }
export function shiftMonth(month, delta) {
  const [year, m] = month.split('-').map(Number);
  const d = new Date(Date.UTC(year, m - 1 + delta, 1));
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}`;
}
export function monthLabel(month, short = false) {
  return new Date(`${month}-01T12:00:00`).toLocaleDateString('en-IN', { month: short ? 'short' : 'long', year: 'numeric' });
}
export function recentMonths(month, count = 6) { return Array.from({ length: count }, (_, i) => shiftMonth(month, i - count + 1)); }
export function formatDate(value, withYear = true) {
  if (!validISO(value)) return 'Not set';
  return new Date(`${value}T12:00:00`).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', ...(withYear ? { year: 'numeric' } : {}) });
}
export function moneyToPaise(value) {
  const text = String(value).trim();
  if (!/^\d{1,7}(\.\d{1,2})?$/.test(text)) throw new Error('Enter a valid amount with up to two decimal places (maximum ₹99,99,999.99).');
  const [whole, fraction = ''] = text.split('.');
  return Number(whole) * 100 + Number(fraction.padEnd(2, '0'));
}
export function moneyInput(paise) { return paise ? String(Number((paise / 100).toFixed(2))) : ''; }
export function formatMoney(paise = 0, compact = false) {
  const amount = Number(paise || 0) / 100;
  if (compact && Math.abs(amount) >= 100000) return `₹${new Intl.NumberFormat('en-IN', { maximumFractionDigits: 2 }).format(amount / 100000)}L`;
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 0, maximumFractionDigits: compact || Number.isInteger(amount) ? 0 : 2 }).format(amount);
}
export function formatDistance(km, unit = 'km', compact = false) {
  const value = Number(km || 0) / (unit === 'mi' ? 1.609344 : 1);
  return `${new Intl.NumberFormat('en-IN', { maximumFractionDigits: compact ? 1 : 0 }).format(value)} ${unit}`;
}
export function distanceToKm(value, unit = 'km') { return Math.round(Number(value) * (unit === 'mi' ? 1.609344 : 1)); }
export function distanceFromKm(value, unit = 'km') { return value == null ? '' : String(Math.round(Number(value) / (unit === 'mi' ? 1.609344 : 1))); }
export function sumExpenses(expenses) { return expenses.reduce((total, expense) => total + expense.amount_paise, 0); }
export function inMonth(expenses, month) { return expenses.filter(e => e.spent_on.startsWith(month)); }
export function categoryTotals(expenses) {
  return CATEGORIES.map(category => ({ ...category, amount: sumExpenses(expenses.filter(e => e.category === category.id)) })).filter(c => c.amount > 0).sort((a, b) => b.amount - a.amount);
}
export function filterExpenses(expenses, { query = '', vehicle = 'all', category = 'all', month = 'all', from = '', to = '', sort = 'newest' } = {}) {
  const search = query.trim().toLowerCase();
  return expenses.filter(e =>
    (vehicle === 'all' || e.vehicle_id === vehicle) &&
    (category === 'all' || e.category === category) &&
    (month === 'all' || e.spent_on.startsWith(month)) &&
    (!from || e.spent_on >= from) && (!to || e.spent_on <= to) &&
    (!search || [e.title, e.vendor, e.notes, categoryFor(e.category).label].join(' ').toLowerCase().includes(search))
  ).sort((a, b) => sort === 'amount' ? b.amount_paise - a.amount_paise : sort === 'oldest' ? a.spent_on.localeCompare(b.spent_on) || String(a.created_at).localeCompare(String(b.created_at)) : b.spent_on.localeCompare(a.spent_on) || String(b.created_at).localeCompare(String(a.created_at)));
}
export function daysUntil(date, today = localISO()) {
  if (!validISO(date)) return Infinity;
  return Math.round((Date.parse(`${date}T00:00:00Z`) - Date.parse(`${today}T00:00:00Z`)) / 86400000);
}
export function buildReminders(vehicles, profile = DEFAULT_PROFILE, today = localISO()) {
  if (!profile.reminders_enabled) return [];
  const reminders = [];
  const distanceUnit = profile.distance_unit || 'km';
  for (const vehicle of vehicles) {
    const base = { vehicleId: vehicle.id, vehicleName: vehicle.name };
    if (vehicle.insurance_expiry) {
      const days = daysUntil(vehicle.insurance_expiry, today);
      if (days <= profile.reminder_days) reminders.push({ ...base, id: `${vehicle.id}-insurance`, kind: 'insurance', title: 'Insurance renewal', date: vehicle.insurance_expiry, days, detail: days < 0 ? `Expired ${Math.abs(days)} days ago` : days === 0 ? 'Expires today' : `Due in ${days} days`, urgent: days <= 7 });
    }
    const dateDays = daysUntil(vehicle.service_due_date, today);
    const kmLeft = vehicle.service_due_km == null ? Infinity : vehicle.service_due_km - vehicle.odometer_km;
    if (dateDays <= profile.reminder_days || kmLeft <= 500) {
      const byDistance = kmLeft <= 0 && dateDays > 0;
      reminders.push({ ...base, id: `${vehicle.id}-service`, kind: 'service', title: 'Service reminder', date: vehicle.service_due_date, days: dateDays, detail: byDistance ? (kmLeft === 0 ? 'Due at current odometer' : `${formatDistance(Math.abs(kmLeft), distanceUnit)} overdue`) : dateDays < 0 ? `Due ${Math.abs(dateDays)} days ago` : dateDays === 0 ? 'Due today' : `Due in ${dateDays} days`, extra: !byDistance && Number.isFinite(kmLeft) ? `or in ${formatDistance(Math.max(0, kmLeft), distanceUnit)}` : '', urgent: dateDays <= 7 || kmLeft <= 0 });
    }
  }
  return reminders.sort((a, b) => a.days - b.days);
}
export function csvCell(value) {
  let text = String(value ?? '');
  if (typeof value === 'string' && /^[\s]*[=+\-@]/.test(text)) text = `'${text}`;
  if (/^[\t\r\n]/.test(text)) text = `'${text}`;
  return `"${text.replaceAll('"', '""')}"`;
}
export function expensesCSV(expenses, vehicles) {
  const rows = [['Date', 'Vehicle', 'Category', 'Description', 'Amount (INR)', 'Vendor', 'Odometer (km)', 'Fuel (litres)', 'Notes'],
    ...expenses.map(e => [e.spent_on, vehicles.find(v => v.id === e.vehicle_id)?.name || '', categoryFor(e.category).label, e.title, (e.amount_paise / 100).toFixed(2), e.vendor, e.odometer_km ?? '', e.fuel_litres ?? '', e.notes])];
  return '\uFEFF' + rows.map(row => row.map(csvCell).join(',')).join('\r\n');
}
export function initials(name = '') { return name.trim().split(/\s+/).slice(0, 2).map(s => s[0]).join('').toUpperCase() || 'ME'; }
export function vehicleLabel(vehicle) { return [vehicle.make, vehicle.model].filter(Boolean).join(' ') || vehicle.name; }
