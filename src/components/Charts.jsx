import { useId } from 'react';
import { categoryTotals, formatMoney, recentMonths, shiftMonth, sumExpenses } from '../lib/logic.mjs';
import { EmptyState } from './ui';
import { ChartNoAxesCombined } from 'lucide-react';

export function SpendingChart({ expenses, month, onMonth }) {
  const months = recentMonths(month === 'all' ? new Date().toISOString().slice(0, 7) : month);
  const values = months.map(m => ({ month: m, total: sumExpenses(expenses.filter(e => e.spent_on.startsWith(m))) }));
  const max = Math.max(...values.map(v => v.total), 100000);
  const ceiling = Math.ceil(max / 100000) * 100000;
  const id = useId();
  return <div className="spending-chart"><div className="chart-y-axis">{[1, .75, .5, .25, 0].map(part => <span key={part}>{formatMoney(ceiling * part, true)}</span>)}</div><div className="chart-plot"><div className="chart-grid">{[0, 1, 2, 3, 4].map(i => <i key={i}/>)}</div><div className="chart-bars">{values.map((v, i) => <button key={v.month} className={`chart-bar-group ${v.month === month ? 'selected' : ''}`} onClick={() => onMonth?.(v.month)} aria-label={`${new Date(`${v.month}-01T12:00:00`).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}: ${formatMoney(v.total)}. View expenses.`}><span className="bar-track"><span className={`bar ${i === 5 ? 'current' : ''}`} style={{ height: `${Math.max(v.total ? 4 : 0, v.total / ceiling * 100)}%` }}><span className="bar-tooltip">{formatMoney(v.total)}</span></span></span><span className="bar-label">{new Date(`${v.month}-01T12:00:00`).toLocaleDateString('en-IN', { month: 'short' })}</span></button>)}</div></div><table className="sr-only"><caption>Expenses over the last six months</caption><tbody>{values.map(v => <tr key={v.month}><th>{v.month}</th><td>{formatMoney(v.total)}</td></tr>)}</tbody></table></div>;
}
export function CategoryChart({ expenses, onSelect }) {
  const categories = categoryTotals(expenses);
  const total = sumExpenses(expenses);
  const radius = 65, circumference = 2 * Math.PI * radius;
  let offset = 0;
  return categories.length ? <div className="category-chart"><div className="donut-wrap"><svg viewBox="0 0 180 180" role="img" aria-label={`Expense breakdown. Total ${formatMoney(total)}`}><circle cx="90" cy="90" r={radius} fill="none" stroke="var(--line)" strokeWidth="20"/>{categories.map(c => { const length = c.amount / total * circumference; const currentOffset = offset; offset += length; return <circle key={c.id} cx="90" cy="90" r={radius} fill="none" stroke={c.color} strokeWidth="20" strokeDasharray={`${Math.max(0, length - 4)} ${circumference - Math.max(0, length - 4)}`} strokeDashoffset={-currentOffset} transform="rotate(-90 90 90)" strokeLinecap="butt"><title>{c.label}: {formatMoney(c.amount)}</title></circle>; })}</svg><div className="donut-center"><span>Total spend</span><strong>{formatMoney(total, true)}</strong><small>{expenses.length} expenses</small></div></div><div className="chart-legend">{categories.map(c => <button key={c.id} onClick={() => onSelect?.(c.id)} title={`View ${c.label} expenses`}><span className="legend-dot" style={{ background: c.color }}/><span>{c.label}</span><strong>{Math.round(c.amount / total * 100)}%</strong></button>)}</div></div> : <EmptyState compact icon={ChartNoAxesCombined} title="A clearer picture starts here" description="Your spending breakdown appears after your first expense."/>;
}
