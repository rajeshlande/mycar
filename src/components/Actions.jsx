import { createContext, useContext, useState } from 'react';
import { useData } from '../lib/data';
import { expensesCSV, formatMoney, localISO, sumExpenses } from '../lib/logic.mjs';
import { dataMessage } from '../lib/supabase';
import ExpenseForm from './ExpenseForm';
import VehicleForm from './VehicleForm';
import { ConfirmDialog, downloadFile, useToast } from './ui';

const ActionsContext = createContext(null);
export function ActionsProvider({ children }) {
  const data = useData();
  const notify = useToast();
  const [expenseEditor, setExpenseEditor] = useState(null);
  const [vehicleEditor, setVehicleEditor] = useState(null);
  const [deletion, setDeletion] = useState(null);
  const addExpense = (vehicleId) => {
    if (!data.vehicles.length) { notify('First, add a vehicle. Then its expenses have a home.', 'info'); setVehicleEditor({ vehicle: null, thenExpense: true }); return; }
    setExpenseEditor({ expense: null, vehicleId });
  };
  const editExpense = expense => setExpenseEditor({ expense });
  const addVehicle = () => setVehicleEditor({ vehicle: null });
  const editVehicle = vehicle => setVehicleEditor({ vehicle });
  const requestDelete = (kind, record) => { setExpenseEditor(null); setVehicleEditor(null); setDeletion({ kind, record }); };
  const exportExpenses = (expenses = data.expenses) => {
    if (!expenses.length) { notify('There are no expenses to export yet.', 'info'); return; }
    downloadFile(`mycar-expenses-${localISO()}.csv`, expensesCSV(expenses, data.vehicles));
    notify(`${expenses.length} expense${expenses.length === 1 ? '' : 's'} exported as CSV.`);
  };
  const confirmDelete = async () => {
    try {
      if (deletion.kind === 'vehicle') await data.deleteVehicle(deletion.record.id); else await data.deleteExpense(deletion.record.id);
      notify(data.demo ? 'Removed from this sample preview.' : `${deletion.kind === 'vehicle' ? 'Vehicle and its expenses' : 'Expense'} deleted.`);
    } catch (err) { throw new Error(dataMessage(err)); }
  };
  const count = deletion?.kind === 'vehicle' ? data.expenses.filter(e => e.vehicle_id === deletion.record.id).length : 0;
  return <ActionsContext.Provider value={{ addExpense, editExpense, addVehicle, editVehicle, requestDelete, exportExpenses }}>{children}{expenseEditor && <ExpenseForm key={expenseEditor.expense?.id || 'new'} expense={expenseEditor.expense} initialVehicle={expenseEditor.vehicleId} onClose={() => setExpenseEditor(null)} onDelete={record => requestDelete('expense', record)}/>} {vehicleEditor && <VehicleForm key={vehicleEditor.vehicle?.id || 'new'} vehicle={vehicleEditor.vehicle} onClose={() => setVehicleEditor(null)} onSaved={id => { if (vehicleEditor.thenExpense) setExpenseEditor({ expense: null, vehicleId: id }); }} onDelete={record => requestDelete('vehicle', record)}/>} {deletion && <ConfirmDialog title={deletion.kind === 'vehicle' ? 'Say goodbye to this vehicle?' : 'Delete this expense?'} description={deletion.kind === 'vehicle' ? `“${deletion.record.name}” and its ${count} expense${count === 1 ? '' : 's'} will be permanently deleted. Export your expenses first if you want to keep a copy.` : `“${deletion.record.title}” (${formatMoney(deletion.record.amount_paise)}) will be permanently removed and your totals will update.`} label={deletion.kind === 'vehicle' ? 'Delete vehicle & expenses' : 'Delete expense'} onConfirm={confirmDelete} onClose={() => setDeletion(null)}><p className="muted small">This action cannot be undone.</p></ConfirmDialog>}</ActionsContext.Provider>;
}
export const useActions = () => useContext(ActionsContext);
