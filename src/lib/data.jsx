import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { supabase, dataMessage } from './supabase';
import { DEFAULT_PROFILE } from './logic.mjs';
import { makeSampleData } from './sample';

const DataContext = createContext(null);
const vehicleFields = ['name','make','model','year','registration','fuel_type','transmission','body_type','color','odometer_km','purchase_date','insurance_expiry','service_due_date','service_due_km','notes'];
const expenseFields = ['vehicle_id','title','category','amount_paise','spent_on','odometer_km','fuel_litres','vendor','notes'];
const profileFields = ['full_name','phone','city','bio','distance_unit','monthly_budget_paise','reminders_enabled','reminder_days','theme'];
const pick = (object, fields) => Object.fromEntries(fields.filter(key => object[key] !== undefined).map(key => [key, object[key]]));

async function allRows(table, userId, order, signal) {
  const rows = [];
  for (let offset = 0; ; offset += 1000) {
    const { data, error } = await supabase.from(table).select('*').eq('user_id', userId).order(order, { ascending: false }).order('id').range(offset, offset + 999).abortSignal(signal);
    if (error) throw error;
    rows.push(...data);
    if (data.length < 1000) return rows;
  }
}

export function DataProvider({ mode = 'supabase', user, children }) {
  const demo = mode === 'demo';
  const [state, setState] = useState(() => demo ? makeSampleData() : { profile: { ...DEFAULT_PROFILE }, vehicles: [], expenses: [] });
  const [loading, setLoading] = useState(!demo);
  const [error, setError] = useState('');
  const [updatedAt, setUpdatedAt] = useState(null);
  const alive = useRef(true);
  const request = useRef(0);
  const activeController = useRef(null);
  useEffect(() => { alive.current = true; return () => { alive.current = false; request.current++; activeController.current?.abort(); }; }, []);

  const refresh = useCallback(async () => {
    if (demo || !supabase || !user) return false;
    const id = ++request.current;
    activeController.current?.abort();
    const controller = new AbortController();
    activeController.current = controller;
    const timer = setTimeout(() => controller.abort(), 20000);
    setLoading(true); setError('');
    try {
      const [profileResult, vehicles, expenses] = await Promise.all([
        supabase.from('profiles').select('*').eq('id', user.id).abortSignal(controller.signal).single(),
        allRows('vehicles', user.id, 'created_at', controller.signal),
        allRows('expenses', user.id, 'spent_on', controller.signal),
      ]);
      if (profileResult.error) throw profileResult.error;
      if (!alive.current || id !== request.current) return false;
      setState({ profile: { ...DEFAULT_PROFILE, ...profileResult.data }, vehicles, expenses });
      setUpdatedAt(new Date());
      return true;
    } catch (err) {
      if (alive.current && id === request.current) setError(controller.signal.aborted ? 'Loading timed out. Check your connection and retry.' : err?.code === 'PGRST116' ? 'Your profile is missing. Run the myCar schema SQL in Supabase, then retry.' : dataMessage(err));
      return false;
    } finally {
      clearTimeout(timer);
      if (activeController.current === controller) activeController.current = null;
      if (alive.current && id === request.current) setLoading(false);
    }
  }, [demo, user?.id]);

  useEffect(() => { if (!demo) refresh(); }, [refresh, demo]);

  const saveProfile = async values => {
    const payload = pick(values, profileFields);
    if (demo) { setState(s => ({ ...s, profile: { ...s.profile, ...payload } })); return; }
    const { data, error } = await supabase.from('profiles').update(payload).eq('id', user.id).select().single();
    if (error) throw error;
    setState(s => ({ ...s, profile: data }));
  };

  const saveVehicle = async (values, existingId) => {
    const payload = pick(values, vehicleFields);
    const wantsPrimary = Boolean(values.is_primary);
    if (demo) {
      const id = existingId || crypto.randomUUID();
      const primary = wantsPrimary || state.vehicles.length === 0;
      const row = { ...state.vehicles.find(v => v.id === existingId), ...payload, id, user_id: user.id, is_primary: primary, created_at: new Date().toISOString() };
      setState(s => ({ ...s, vehicles: [...s.vehicles.map(v => ({ ...v, is_primary: primary ? false : v.is_primary })).filter(v => v.id !== id), row] }));
      return id;
    }
    let saved;
    if (existingId) {
      const { data, error } = await supabase.from('vehicles').update(payload).eq('id', existingId).select().single();
      if (error) throw error;
      saved = data;
    } else {
      const first = state.vehicles.length === 0;
      const { data, error } = await supabase.from('vehicles').insert({ ...payload, is_primary: first }).select().single();
      if (error) throw error;
      saved = data;
    }
    if (wantsPrimary && !saved.is_primary) {
      const { error } = await supabase.rpc('set_primary_vehicle', { p_vehicle_id: saved.id });
      if (error) throw error;
    }
    await refresh();
    return saved.id;
  };

  const deleteVehicle = async id => {
    if (demo) {
      setState(s => {
        const vehicles = s.vehicles.filter(v => v.id !== id);
        if (vehicles.length && !vehicles.some(v => v.is_primary)) vehicles[0] = { ...vehicles[0], is_primary: true };
        return { ...s, vehicles, expenses: s.expenses.filter(e => e.vehicle_id !== id) };
      });
      return;
    }
    const { error } = await supabase.from('vehicles').delete().eq('id', id).select('id').single();
    if (error) throw error;
    await refresh();
  };

  const saveExpense = async (values, existingId) => {
    const payload = pick(values, expenseFields);
    if (demo) {
      const row = { ...values, ...payload, id: existingId || crypto.randomUUID(), user_id: user.id, created_at: state.expenses.find(e => e.id === existingId)?.created_at || new Date().toISOString() };
      setState(s => ({ ...s, expenses: [row, ...s.expenses.filter(e => e.id !== existingId)] }));
      return row.id;
    }
    const query = existingId ? supabase.from('expenses').update(payload).eq('id', existingId) : supabase.from('expenses').insert(payload);
    const { data, error } = await query.select().single();
    if (error) throw error;
    await refresh();
    return data.id;
  };

  const deleteExpense = async id => {
    if (demo) { setState(s => ({ ...s, expenses: s.expenses.filter(e => e.id !== id) })); return; }
    const { error } = await supabase.from('expenses').delete().eq('id', id).select('id').single();
    if (error) throw error;
    await refresh();
  };

  return <DataContext.Provider value={{ ...state, demo, loading, error, updatedAt, refresh, saveProfile, saveVehicle, deleteVehicle, saveExpense, deleteExpense }}>{children}</DataContext.Provider>;
}
export function useData() { const context = useContext(DataContext); if (!context) throw new Error('useData requires DataProvider'); return context; }
