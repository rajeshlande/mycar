import { createContext, useContext, useEffect, useId, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { CarFront, X, Check, AlertCircle, Info, Fuel, Wrench, ShieldCheck, SquareParking, Route, Receipt, ArrowUpRight, LoaderCircle, CalendarDays, ChevronLeft, ChevronRight, SearchX, Car, Plus } from 'lucide-react';
import { categoryFor, currentMonth, initials, shiftMonth } from '../lib/logic.mjs';

const ToastContext = createContext(null);
export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const timers = useRef(new Set());
  useEffect(() => () => timers.current.forEach(clearTimeout), []);
  const dismiss = id => setToasts(items => items.filter(t => t.id !== id));
  const notify = (message, type = 'success') => {
    const id = crypto.randomUUID();
    setToasts(items => [...items.slice(-2), { id, message, type }]);
    const timer = setTimeout(() => { dismiss(id); timers.current.delete(timer); }, type === 'error' ? 8500 : 4500);
    timers.current.add(timer);
  };
  return <ToastContext.Provider value={notify}>{children}<div className="toast-stack" aria-live="polite" aria-atomic="false">{toasts.map(t => <div className={`toast ${t.type}`} key={t.id} role={t.type === 'error' ? 'alert' : 'status'}>{t.type === 'error' ? <AlertCircle size={19}/> : t.type === 'info' ? <Info size={19}/> : <span className="toast-check"><Check size={14}/></span>}<span>{t.message}</span><button className="icon-button" aria-label="Dismiss notification" onClick={() => dismiss(t.id)}><X size={16}/></button></div>)}</div></ToastContext.Provider>;
}
export const useToast = () => useContext(ToastContext);
export function Logo({ compact = false, light = false }) { return <div className={`logo ${light ? 'logo-light' : ''}`} aria-label="myCar"><span className="logo-mark"><CarFront size={25} strokeWidth={1.8}/></span>{!compact && <span className="logo-word">my<span>Car</span><i/></span>}</div>; }
export function Avatar({ name, size = '', className = '' }) { return <span className={`avatar ${size} ${className}`}>{initials(name)}</span>; }
export function Spinner({ label = 'Loading your garage…' }) { return <div className="loading-state" role="status"><LoaderCircle className="spin" size={26}/><span>{label}</span></div>; }
export function Notice({ children, type = 'info', className = '', ...props }) { return <div className={`notice ${type} ${className}`} role={type === 'error' ? 'alert' : undefined}{...props}>{type === 'error' ? <AlertCircle size={18}/> : type === 'success' ? <Check size={18}/> : <Info size={18}/>}<div>{children}</div></div>; }
export function Field({ label, hint, children, className = '', ...props }) {
  const generatedId = useId();
  const id = props.id || generatedId;
  return <div className={`field ${className}`}><label htmlFor={id}>{label}{props.required && <span className="required-dot"> *</span>}</label>{typeof children === 'function' ? children(id) : children}{hint && <small id={`${id}-hint`}>{hint}</small>}</div>;
}
export function CategoryIcon({ category, size = 19, className = '' }) {
  const item = categoryFor(category);
  const Icons = { Fuel, Wrench, ShieldCheck, SquareParking, Route, Receipt };
  const Icon = Icons[item.icon] || Receipt;
  return <span className={`category-icon ${className}`} style={{ '--category-color': item.color, '--category-tint': item.tint }}><Icon size={size} strokeWidth={1.8}/></span>;
}
export function PageHeading({ eyebrow, title, description, children }) { return <div className="page-heading"><div>{eyebrow && <div className="eyebrow">{eyebrow}</div>}<h1>{title}</h1>{description && <p>{description}</p>}</div>{children && <div className="page-actions">{children}</div>}</div>; }
export function EmptyState({ icon: Icon = SearchX, title, description, action, compact = false }) { return <div className={`empty-state ${compact ? 'compact' : ''}`}><span className="empty-icon"><Icon size={28} strokeWidth={1.5}/></span><h3>{title}</h3>{description && <p>{description}</p>}{action}</div>; }
export function StatCard({ label, value, icon: Icon, tone = 'green', children, className = '' }) { return <div className={`stat-card ${className}`}><div className="stat-top"><span>{label}</span><span className={`stat-icon ${tone}`}><Icon size={18} strokeWidth={1.7}/></span></div><strong className="stat-value">{value}</strong><div className="stat-foot">{children}</div></div>; }
export function MonthPicker({ value, onChange, allowAll = false }) { return <div className="month-picker"><button className="icon-button" aria-label="Previous month" onClick={() => onChange(shiftMonth(value === 'all' ? currentMonth() : value, -1))}><ChevronLeft size={16}/></button><label><CalendarDays size={16}/><select aria-label="Select month" value={value} onChange={e => onChange(e.target.value)}>{allowAll && <option value="all">All time</option>}{Array.from({ length: 36 }, (_, i) => shiftMonth(currentMonth(), -i)).map(m => <option key={m} value={m}>{new Date(`${m}-01T12:00:00`).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}</option>)}</select></label><button className="icon-button" aria-label="Next month" disabled={value === 'all' || value >= currentMonth()} onClick={() => onChange(shiftMonth(value, 1))}><ChevronRight size={16}/></button></div>; }
export function Modal({ title, subtitle, children, onClose, busy = false, wide = false, className = '' }) {
  const titleId = useId();
  const ref = useRef(null);
  const previousFocus = useRef(null);
  const closeRef = useRef(onClose); closeRef.current = onClose;
  const busyRef = useRef(busy); busyRef.current = busy;
  useLayoutEffect(() => {
    previousFocus.current = document.activeElement;
    const first = ref.current?.querySelector('[data-autofocus]') || ref.current?.querySelector('input:not([type="hidden"]), select, textarea') || ref.current?.querySelector('button');
    (first || ref.current)?.focus();
    // Restore before a replacement dialog mounts, so an old dialog cannot steal its focus.
    return () => { if (previousFocus.current?.isConnected) previousFocus.current.focus(); };
  }, []);
  useEffect(() => {
    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const keydown = e => {
      if (e.key === 'Escape' && !busyRef.current) closeRef.current();
      if (e.key !== 'Tab') return;
      const nodes = [...(ref.current?.querySelectorAll('button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), a[href], [tabindex="0"]') || [])].filter(el => el.getClientRects().length);
      if (!nodes.length) { e.preventDefault(); return; }
      const first = nodes[0], last = nodes.at(-1);
      if (e.shiftKey && (document.activeElement === first || !ref.current?.contains(document.activeElement))) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && (document.activeElement === last || !ref.current?.contains(document.activeElement))) { e.preventDefault(); first.focus(); }
    };
    document.addEventListener('keydown', keydown);
    return () => { document.body.style.overflow = overflow; document.removeEventListener('keydown', keydown); };
  }, []);
  return createPortal(<div className="modal-backdrop" onMouseDown={e => { if (e.target === e.currentTarget && !busy) onClose(); }}><section ref={ref} className={`modal ${wide ? 'wide' : ''} ${className}`} role="dialog" aria-modal="true" aria-labelledby={titleId} tabIndex={-1}><header className="modal-header"><div><h2 id={titleId}>{title}</h2>{subtitle && <p>{subtitle}</p>}</div><button className="icon-button" aria-label="Close dialog" onClick={onClose} disabled={busy}><X size={21}/></button></header>{children}</section></div>, document.body);
}
export function ConfirmDialog({ title, description, label = 'Delete', onConfirm, onClose, children }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const confirm = async () => { setBusy(true); setError(''); try { await onConfirm(); onClose(); } catch (err) { setError(err.message || 'That didn’t work. Please try again.'); } finally { setBusy(false); } };
  return <Modal title={title} onClose={onClose} busy={busy} className="confirm-modal"><div className="modal-body"><span className="danger-icon"><AlertCircle size={27}/></span><p className="confirm-description">{description}</p>{children}{error && <Notice type="error">{error}</Notice>}</div><footer className="modal-footer"><button className="button secondary" onClick={onClose} disabled={busy}>Keep it</button><button className="button danger" onClick={confirm} disabled={busy}>{busy ? <LoaderCircle size={17} className="spin"/> : null}{busy ? 'Deleting…' : label}</button></footer></Modal>;
}
export function CarArt({ color = 'silver', className = '' }) {
  const paint = { silver: '#bec9c5', white: '#f2f1e9', black: '#43524b', blue: '#789ab6', red: '#b86e64', green: '#70937b' }[color] || '#bec9c5';
  return <svg className={`car-art ${className}`} viewBox="0 0 420 180" fill="none" aria-hidden="true"><ellipse cx="214" cy="149" rx="165" ry="12" fill="currentColor" opacity=".08"/><path d="M65 104 89 91l45-51c7-8 17-12 28-12h91c12 0 24 5 32 15l39 47 35 12c10 4 16 13 16 24v14H49v-17c0-9 6-16 16-19Z" fill={paint}/><path d="m145 43-34 44h88V40h-36c-7 0-13 1-18 3Zm66-3v47h91l-35-42c-3-3-7-5-12-5h-44Z" fill="#24483d" opacity=".85"/><path d="M53 124h318M103 95h218" stroke="#fff" strokeOpacity=".35" strokeWidth="3"/><path d="M207 94v40M310 96l9 28" stroke="#24483d" strokeOpacity=".25" strokeWidth="2"/><rect x="224" y="98" width="18" height="4" rx="2" fill="#24483d" opacity=".5"/><rect x="121" y="98" width="18" height="4" rx="2" fill="#24483d" opacity=".5"/><path d="M52 111h29l-5 12H50M348 108h20l5 13h-25" fill="#f7e9b5"/><circle cx="114" cy="138" r="28" fill="#263b32"/><circle cx="114" cy="138" r="16" fill="#91a29a"/><circle cx="114" cy="138" r="7" fill="#d8dfda"/><circle cx="316" cy="138" r="28" fill="#263b32"/><circle cx="316" cy="138" r="16" fill="#91a29a"/><circle cx="316" cy="138" r="7" fill="#d8dfda"/><path d="M198 39v48" stroke="#fff" strokeOpacity=".3" strokeWidth="2"/></svg>;
}
export function useOnline() { const [online, setOnline] = useState(navigator.onLine); useEffect(() => { const update = () => setOnline(navigator.onLine); window.addEventListener('online', update); window.addEventListener('offline', update); return () => { window.removeEventListener('online', update); window.removeEventListener('offline', update); }; }, []); return online; }
export function downloadFile(name, content, type = 'text/csv;charset=utf-8') { const url = URL.createObjectURL(new Blob([content], { type })); const link = document.createElement('a'); link.href = url; link.download = name; document.body.appendChild(link); link.click(); link.remove(); setTimeout(() => URL.revokeObjectURL(url), 1000); }
