import { DEFAULT_PROFILE, currentMonth, shiftMonth, localISO } from './logic.mjs';
import { readTheme } from './theme.js';

// Fictional, explicitly labeled preview records. Never written to Supabase or local storage.
export function makeSampleData() {
  const month = currentMonth();
  const today = localISO();
  const day = today.slice(0, 8);
  const date = n => `${day}${String(n).padStart(2, '0')}`;
  const profile = { ...DEFAULT_PROFILE, id: 'sample-user', full_name: 'Alex Morgan', phone: '', city: 'Pune', bio: 'Weekend drives, well-kept cars, and one less thing to worry about.', monthly_budget_paise: 3000000, theme: readTheme() };
  const vehicles = [
    { id: 'sample-creta', user_id: 'sample-user', name: 'My Creta', make: 'Hyundai', model: 'Creta', year: 2023, registration: 'MH 12 AB 1234', fuel_type: 'Petrol', transmission: 'Automatic', body_type: 'SUV', color: 'silver', odometer_km: 24850, purchase_date: '2023-06-15', insurance_expiry: `${shiftMonth(month, 1)}-12`, service_due_date: `${shiftMonth(month, 1)}-05`, service_due_km: 25000, notes: 'The everyday companion. Usually serviced at the authorized workshop.', is_primary: true, created_at: '2023-06-15T10:00:00Z' },
    { id: 'sample-nexon', user_id: 'sample-user', name: 'City runabout', make: 'Tata', model: 'Nexon EV', year: 2024, registration: 'MH 14 CD 5678', fuel_type: 'Electric', transmission: 'Automatic', body_type: 'SUV', color: 'blue', odometer_km: 12340, purchase_date: '2024-03-20', insurance_expiry: `${shiftMonth(month, 4)}-18`, service_due_date: `${shiftMonth(month, 3)}-10`, service_due_km: 15000, notes: 'Quiet, efficient, and perfect for the daily commute.', is_primary: false, created_at: '2024-03-20T10:00:00Z' },
  ];
  const entries = [
    ['Full tank', 'fuel', 420000, 0, 'sample-creta', 'Indian Oil', 24850, 40.2],
    ['Periodic service', 'service', 680000, 0, 'sample-creta', 'Hyundai Service', 24620, null],
    ['Insurance renewal', 'insurance', 450000, 0, 'sample-creta', 'Policybazaar', null, null],
    ['Fuel top-up', 'fuel', 385000, 0, 'sample-creta', 'HP Petrol Pump', 24400, 36.7],
    ['Airport parking', 'parking', 35000, 0, 'sample-nexon', 'Pune Airport', null, null],
    ['FASTag recharge', 'tolls', 118000, 0, 'sample-creta', 'NHAI', null, null],
    ['Premium car wash', 'other', 50000, 0, 'sample-creta', 'The Detailing Co.', null, null],
    ['Fuel top-up', 'fuel', 320000, 0, 'sample-creta', 'Indian Oil', 24080, 30.5],
  ];
  const expenses = entries.map((e, i) => ({ id: `sample-expense-${i}`, user_id: 'sample-user', title: e[0], category: e[1], amount_paise: e[2], spent_on: date(1), vehicle_id: e[4], vendor: e[5], odometer_km: e[6], fuel_litres: e[7], notes: i === 1 ? 'Engine oil, oil filter, wheel alignment and a full check-up.' : '', created_at: `${date(1)}T${String(18 - i).padStart(2, '0')}:00:00Z` }));
  let index = 8;
  for (let ago = 1; ago <= 5; ago++) {
    const m = shiftMonth(month, -ago);
    const records = [
      ['Monthly fuel', 'fuel', 940000 + ago * 37000, 'sample-creta', 'Indian Oil', 28],
      ['Scheduled service', 'service', 320000 + ago * 85000, 'sample-creta', 'Hyundai Service', 20],
      ['Charging & parking', 'parking', 80000 + ago * 4500, 'sample-nexon', 'Metro Parking', 17],
      ['Highway tolls', 'tolls', 96000 + ago * 3500, 'sample-creta', 'NHAI', 12],
      ['Car care essentials', 'other', 65000 + ago * 2500, 'sample-creta', 'Auto Store', 6],
    ];
    for (const [title, category, amount_paise, vehicle_id, vendor, d] of records) expenses.push({ id: `sample-expense-${index++}`, user_id: 'sample-user', vehicle_id, title, category, amount_paise, spent_on: `${m}-${d}`, vendor, odometer_km: null, fuel_litres: null, notes: '', created_at: `${m}-${d}T10:00:00Z` });
  }
  return { profile, vehicles, expenses };
}
