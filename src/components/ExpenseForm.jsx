import { useState } from 'react';
import { Check, LoaderCircle, Trash2, Receipt, Info } from 'lucide-react';
import { CATEGORIES, moneyToPaise, moneyInput, localISO, validISO, distanceToKm, distanceFromKm } from '../lib/logic.mjs';
import { dataMessage } from '../lib/supabase';
import { useData } from '../lib/data';
import { Modal, Field, Notice, CategoryIcon, useToast } from './ui';

export default function ExpenseForm({ expense, initialVehicle, onClose, onDelete }) {
  const { vehicles, profile, saveExpense, demo } = useData();
  const notify = useToast();
  const [form, setForm] = useState({ title: expense?.title || '', amount: moneyInput(expense?.amount_paise), category: expense?.category || 'fuel', vehicle_id: expense?.vehicle_id || initialVehicle || vehicles.find(v => v.is_primary)?.id || vehicles[0]?.id || '', spent_on: expense?.spent_on || localISO(), vendor: expense?.vendor || '', odometer: distanceFromKm(expense?.odometer_km, profile.distance_unit), fuel_litres: expense?.fuel_litres ?? '', notes: expense?.notes || '' });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const update = (key, value) => setForm(f => ({ ...f, [key]: value }));
  const vehicle = vehicles.find(v => v.id === form.vehicle_id);
  const showFuel = form.category === 'fuel' && !['Electric', 'CNG'].includes(vehicle?.fuel_type);
  const submit = async e => {
    e.preventDefault(); setError('');
    try {
      if (!form.title.trim()) throw new Error('Give this expense a short description.');
      const amount_paise = moneyToPaise(form.amount);
      if (amount_paise <= 0) throw new Error('The amount must be greater than zero.');
      if (!vehicle) throw new Error('Choose a vehicle from your garage.');
      if (!validISO(form.spent_on) || form.spent_on > localISO()) throw new Error('Choose a valid expense date, today or earlier.');
      const odometer_km = form.odometer === '' ? null : distanceToKm(form.odometer, profile.distance_unit);
      if (odometer_km !== null && (!Number.isFinite(odometer_km) || odometer_km < 0 || odometer_km > 2000000 || !/^\d+(\.\d+)?$/.test(form.odometer))) throw new Error('Enter a valid, positive odometer reading.');
      const fuel_litres = showFuel && form.fuel_litres !== '' ? Number(form.fuel_litres) : null;
      if (fuel_litres !== null && (!Number.isFinite(fuel_litres) || fuel_litres <= 0 || fuel_litres > 1000 || !/^\d+(\.\d{1,3})?$/.test(String(form.fuel_litres)))) throw new Error('Fuel quantity must be greater than zero, with up to three decimal places.');
      setBusy(true);
      await saveExpense({ title: form.title.trim(), amount_paise, category: form.category, vehicle_id: form.vehicle_id, spent_on: form.spent_on, vendor: form.vendor.trim(), odometer_km, fuel_litres, notes: form.notes.trim() }, expense?.id);
      notify(demo ? 'Expense saved in this sample preview.' : expense ? 'Expense updated. Everything adds up.' : 'Expense added. One less thing to remember.');
      onClose();
    } catch (err) { setError(err.code || err.status ? dataMessage(err) : err.message); }
    finally { setBusy(false); }
  };
  return <Modal title={expense ? 'Edit expense' : 'Add an expense'} subtitle="A small entry today. A clearer picture tomorrow." onClose={onClose} busy={busy} wide><form onSubmit={submit} aria-busy={busy}><div className="modal-body"><div className="category-picker" role="radiogroup" aria-label="Expense category">{CATEGORIES.map(c => <button type="button" role="radio" aria-checked={form.category === c.id} key={c.id} className={form.category === c.id ? 'selected' : ''} onClick={() => update('category', c.id)}><CategoryIcon category={c.id} size={19}/><span>{c.label}</span></button>)}</div><div className="form-grid"><Field label="Amount" required>{id => <div className="amount-input"><span>₹</span><input id={id} data-autofocus type="text" inputMode="decimal" placeholder="0.00" value={form.amount} onChange={e => update('amount', e.target.value)} required maxLength={12} aria-label="Amount in rupees"/></div>}</Field><Field label="Date" required>{id => <input id={id} type="date" value={form.spent_on} max={localISO()} onChange={e => update('spent_on', e.target.value)} required/>}</Field><Field label="Vehicle" required className="full-span">{id => <select id={id} value={form.vehicle_id} onChange={e => update('vehicle_id', e.target.value)} required>{vehicles.map(v => <option key={v.id} value={v.id}>{v.name}{v.registration ? ` · ${v.registration}` : ''}</option>)}</select>}</Field><Field label="Description" required className="full-span">{id => <input id={id} placeholder="e.g. A full tank for the weekend" value={form.title} onChange={e => update('title', e.target.value)} required maxLength={120}/>}</Field><Field label="Paid to / vendor">{id => <input id={id} placeholder="e.g. Indian Oil" value={form.vendor} onChange={e => update('vendor', e.target.value)} maxLength={100}/>}</Field><Field label={`Odometer (${profile.distance_unit})`} hint="Optional">{id => <input id={id} type="number" min="0" max={profile.distance_unit === 'mi' ? 1242742 : 2000000} step="1" placeholder="Current reading" value={form.odometer} onChange={e => update('odometer', e.target.value)}/>}</Field>{showFuel && <Field label="Fuel quantity (litres)" hint="Optional · helps you keep track of fill-ups">{id => <input id={id} type="number" min="0.001" max="1000" step="0.001" placeholder="e.g. 35.5" value={form.fuel_litres} onChange={e => update('fuel_litres', e.target.value)}/>}</Field>}<Field label="Notes" className="full-span">{id => <textarea id={id} rows={2} placeholder="Anything worth remembering? (optional)" value={form.notes} onChange={e => update('notes', e.target.value)} maxLength={1000}/>}</Field></div>{error && <Notice type="error">{error}</Notice>}<p className="form-privacy"><Info size={13}/>{demo ? 'Sample mode: changes stay in memory and reset on refresh.' : 'Only you can access your vehicle and expense records.'}</p></div><footer className="modal-footer">{expense && <button type="button" className="text-button danger-text footer-left" onClick={() => onDelete(expense)} disabled={busy}><Trash2 size={16}/>Delete expense</button>}<button type="button" className="button secondary" onClick={onClose} disabled={busy}>Cancel</button><button className="button primary" disabled={busy}>{busy ? <LoaderCircle size={17} className="spin"/> : <Check size={17}/>} {busy ? 'Saving…' : expense ? 'Save changes' : 'Save expense'}</button></footer></form></Modal>;
}
