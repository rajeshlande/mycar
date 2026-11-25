// Keys are stable account preferences. Missing or invalid values default to visible,
// so newly introduced tiles show up for existing accounts.
export const DASHBOARD_TILES = [
  { id: 'total', label: 'Total spent' },
  { id: 'fuel', label: 'Fuel expenses' },
  { id: 'service', label: 'Service & repairs' },
  { id: 'entries', label: 'Expense entries' },
  { id: 'vehicle', label: 'Vehicle spotlight' },
  { id: 'budget', label: 'Monthly budget' },
  { id: 'reminders', label: 'Reminders' },
  { id: 'spending', label: 'Spending over time' },
  { id: 'breakdown', label: 'Where it goes' },
  { id: 'recent', label: 'Recent expenses' },
];
export function dashboardTileVisibility(value) {
  const input = value && typeof value === 'object' && !Array.isArray(value) ? value : {};
  return Object.fromEntries(DASHBOARD_TILES.map(({ id }) => [id, typeof input[id] === 'boolean' ? input[id] : true]));
}
