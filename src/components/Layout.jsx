import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, ReceiptText, CarFront, UserRound, Settings, LogOut, ChevronRight, Bell, Menu, X, Plus, Download, ArrowRight, ShieldCheck, WifiOff, RefreshCw, Cloud as CloudCheck, CircleHelp, Wrench, Smartphone, Check, ExternalLink } from 'lucide-react';
import { useData } from '../lib/data';
import { useAuth } from '../lib/auth-context';
import { supabase, configured } from '../lib/supabase';
import { useInstall } from '../lib/pwa';
import { setTheme } from '../lib/theme';
import { buildReminders } from '../lib/logic.mjs';
import { useActions } from './Actions';
import { Logo, Avatar, useOnline, useToast, Modal, Notice } from './ui';

const nav = [{ to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard }, { to: '/expenses', label: 'Expenses', icon: ReceiptText }, { to: '/vehicles', label: 'My vehicles', icon: CarFront }];
const accountNav = [{ to: '/profile', label: 'Profile', icon: UserRound }, { to: '/settings', label: 'Settings', icon: Settings }];
export default function Layout({ onExitDemo }) {
  const { profile, vehicles, expenses, demo, error, refresh, loading } = useData();
  const { session } = useAuth();
  const { addExpense } = useActions();
  const { installed, showHelp } = useInstall();
  const online = useOnline(); const notify = useToast(); const navigate = useNavigate(); const location = useLocation();
  const [drawer, setDrawer] = useState(false); const [notifications, setNotifications] = useState(false); const [privacy, setPrivacy] = useState(false); const [signingOut, setSigningOut] = useState(false);
  const notificationRef = useRef(null); const sidebarRef = useRef(null);
  const reminders = buildReminders(vehicles, profile);
  const email = demo ? 'alex@example.com' : session?.user?.email || '';
  const page = [...nav, ...accountNav].find(item => location.pathname.startsWith(item.to))?.label || (location.pathname.startsWith('/vehicles/') ? 'My vehicles' : 'Dashboard');
  useEffect(() => { setDrawer(false); setNotifications(false); window.scrollTo({ top: 0, behavior: 'instant' }); document.title = `${page} · myCar`; }, [location.pathname, page]);
  useEffect(() => { if (!loading && !error) setTheme(profile.theme); }, [profile.theme, loading, error]);
  useEffect(() => { const close = () => { if (window.innerWidth > 900) setDrawer(false); }; window.addEventListener('resize', close); return () => window.removeEventListener('resize', close); }, []);
  useEffect(() => {
    if (!notifications) return;
    const close = e => { if (!notificationRef.current?.contains(e.target)) setNotifications(false); };
    const key = e => { if (e.key === 'Escape') setNotifications(false); };
    document.addEventListener('pointerdown', close); document.addEventListener('keydown', key);
    return () => { document.removeEventListener('pointerdown', close); document.removeEventListener('keydown', key); };
  }, [notifications]);
  useEffect(() => {
    if (!drawer) return;
    const previous = document.activeElement; const overflow = document.body.style.overflow; document.body.style.overflow = 'hidden';
    const timer = setTimeout(() => sidebarRef.current?.querySelector('a,button')?.focus(), 50);
    const key = e => {
      if (e.key === 'Escape') setDrawer(false);
      if (e.key === 'Tab') {
        const items = [...sidebarRef.current.querySelectorAll('a,button')].filter(el => el.getClientRects().length);
        if (e.shiftKey && document.activeElement === items[0]) { e.preventDefault(); items.at(-1)?.focus(); }
        else if (!e.shiftKey && document.activeElement === items.at(-1)) { e.preventDefault(); items[0]?.focus(); }
      }
    };
    document.addEventListener('keydown', key);
    return () => { clearTimeout(timer); document.body.style.overflow = overflow; document.removeEventListener('keydown', key); previous?.focus(); };
  }, [drawer]);
  const signOut = async () => {
    if (demo) { onExitDemo(); return; }
    setSigningOut(true);
    try { const { error } = await supabase.auth.signOut({ scope: 'local' }); if (error && error.code !== 'session_not_found') throw error; navigate('/login', { replace: true }); }
    catch { notify('Couldn’t sign out. Check your connection and try again.', 'error'); }
    finally { setSigningOut(false); }
  };
  const navItem = ({ to, label, icon: Icon }) => <NavLink key={to} to={to} className={({ isActive }) => `nav-item ${isActive || (to === '/vehicles' && location.pathname.startsWith('/vehicles/')) ? 'active' : ''}`}><Icon size={20} strokeWidth={1.7}/><span>{label}</span>{to === '/vehicles' && <span className="nav-count">{vehicles.length}</span>}</NavLink>;
  return <div className="app-shell">{drawer && <button className="sidebar-backdrop" aria-label="Close navigation" onClick={() => setDrawer(false)}/>}<aside ref={sidebarRef} className={`sidebar ${drawer ? 'open' : ''}`} aria-label="Main navigation" {...(drawer ? { role: 'dialog', 'aria-modal': true } : {})}><div className="sidebar-brand"><Link to="/dashboard" aria-label="myCar dashboard"><Logo/></Link><button className="icon-button mobile-only" aria-label="Close navigation" onClick={() => setDrawer(false)}><X size={20}/></button></div><div className="workspace-label"><span className="workspace-dot"/>PERSONAL WORKSPACE</div><nav className="sidebar-nav"><div className="nav-group-label">MY GARAGE</div>{nav.map(navItem)}<div className="nav-group-label account-label">MY ACCOUNT</div>{accountNav.map(navItem)}</nav><div className="sidebar-bottom"><div className="install-card"><span className="install-card-icon"><Smartphone size={24} strokeWidth={1.5}/><span><Check size={9}/></span></span><h3>{installed ? 'Right at home.' : 'myCar, to go.'}</h3><p>{installed ? 'Your garage is installed and ready for the road.' : 'Your garage, always a tap away on your home screen.'}</p><button onClick={showHelp}>{installed ? 'App details' : 'Install app'}<ArrowRight size={14}/></button></div><div className="sidebar-account"><Link to="/profile"><Avatar name={profile.full_name}/><span><strong>{profile.full_name || 'Your profile'}</strong><small>{demo ? 'Sample workspace' : 'Personal account'}</small></span></Link><button className="icon-button" aria-label="Sign out" title={demo ? 'Exit sample preview' : 'Sign out'} onClick={signOut} disabled={signingOut}><LogOut size={18}/></button></div></div></aside><div className="workspace"><header className="topbar"><div className="breadcrumb"><button className="icon-button mobile-only" aria-label="Open navigation" onClick={() => setDrawer(true)}><Menu size={22}/></button><span className="breadcrumb-root">My workspace</span><ChevronRight size={14}/><strong>{page}</strong></div><div className="topbar-actions"><span className={`connection-status ${!online ? 'offline' : ''}`}>{!online ? <WifiOff size={14}/> : demo ? <span className="status-dot"/> : <CloudCheck size={15}/>}<span>{!online ? 'Offline' : demo ? 'Sample preview' : 'Personal garage'}</span></span><div ref={notificationRef} className="notification-wrap"><button className={`icon-button notification-button ${notifications ? 'selected' : ''}`} aria-label={`Notifications${reminders.length ? `, ${reminders.length} reminders` : ''}`} aria-expanded={notifications} onClick={() => setNotifications(v => !v)}><Bell size={20} strokeWidth={1.7}/>{reminders.length > 0 && <span className="notification-dot"/>}</button>{notifications && <section className="notification-popover" aria-label="Vehicle reminders"><header><h3>A little heads-up</h3><span>{reminders.length} reminder{reminders.length === 1 ? '' : 's'}</span></header>{reminders.length ? reminders.map(r => <Link to={`/vehicles/${r.vehicleId}`} key={r.id}><span className={`reminder-icon ${r.urgent ? 'urgent' : ''}`}>{r.kind === 'service' ? <Wrench size={18}/> : <ShieldCheck size={18}/>}</span><span><strong>{r.title}</strong><small>{r.vehicleName} · {r.detail}</small></span><ChevronRight size={15}/></Link>) : <div className="notifications-empty"><Check size={25}/><strong>You’re all caught up.</strong><p>Add service and insurance dates to your vehicles for helpful in-app reminders.</p></div>}<footer><Link to="/settings">Manage reminders<ArrowRight size={13}/></Link></footer></section>}</div><span className="topbar-divider"/><Link to="/profile" className="topbar-profile" aria-label="Open your profile"><Avatar name={profile.full_name}/><span>{profile.full_name?.split(' ')[0] || 'My account'}</span></Link></div></header>{demo && <div className="demo-banner"><span><span className="demo-label">SAMPLE WORKSPACE</span><span>Fictional data. Changes reset on refresh.</span></span><Link to="/setup">Connect your garage<ArrowRight size={14}/></Link></div>}{!online && <div className="offline-banner"><WifiOff size={16}/><span>You’re offline. The app is available, but reconnect to load or save account records.</span></div>}{error && <div className="data-error-banner"><Notice type="error"><strong>Your garage couldn’t be loaded.</strong><span>{error}</span></Notice><button className="button secondary small-button" onClick={refresh} disabled={loading}><RefreshCw size={15} className={loading ? 'spin' : ''}/>Retry</button></div>}<main className="main-content" id="main-content" tabIndex={-1}><Outlet/></main><footer className="app-footer"><span><CarFront size={14}/>A little care goes a long way.</span><span>myCar v1.0<span className="footer-dot">·</span><button onClick={() => setPrivacy(true)}>Privacy & your data</button></span></footer></div><button className="mobile-add button primary" aria-label="Add expense" onClick={() => addExpense()}><Plus size={22}/></button>{privacy && <PrivacyDialog onClose={() => setPrivacy(false)}/>}</div>;
}
export function PrivacyDialog({ onClose }) { return <Modal title="Your garage. Your data." subtitle="A plain-language privacy note." onClose={onClose}><div className="modal-body privacy-content"><span className="privacy-hero-icon"><ShieldCheck size={32}/></span><h3>Private by design</h3><p>Your profile, vehicles, and expenses are stored in the configured Supabase project. Database policies restrict each record to the account that owns it. The project operator controls that backend and its backups.</p><h3>What stays on this device</h3><p>Supabase keeps your sign-in session in browser storage. myCar stores only your theme preference separately. The offline app cache contains public files—not your financial records. Exported CSV files are saved wherever your browser downloads them.</p><h3>Sample workspace</h3><p>The sample uses fictional records in memory only. Preview edits are never sent to Supabase and disappear when you refresh. No sample account or password is created.</p><h3>No hidden passengers</h3><p>This app includes no advertising or analytics trackers. Authentication emails are sent by Supabase. In-app reminders do not send email or push notifications.</p><Notice>Before a public launch, the project owner should publish their own privacy policy, retention rules, and support contact.</Notice></div><footer className="modal-footer"><button className="button primary" onClick={onClose}>Got it<Check size={16}/></button></footer></Modal>; }
