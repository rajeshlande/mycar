import { useEffect, useState } from 'react';
import { HashRouter, Navigate, Outlet, Route, Routes, useNavigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './lib/auth-context';
import { DataProvider } from './lib/data';
import { InstallProvider } from './lib/pwa';
import { supabase } from './lib/supabase';
import { readTheme, applyTheme, THEME_KEY } from './lib/theme';
import { ToastProvider, Spinner } from './components/ui';
import { ActionsProvider } from './components/Actions';
import Layout from './components/Layout';
import AuthPage, { ResetPasswordPage } from './pages/Auth';
import SetupPage from './pages/Setup';
import Dashboard from './pages/Dashboard';
import Expenses from './pages/Expenses';
import Vehicles, { VehicleDetail } from './pages/Vehicles';
import Profile from './pages/Profile';
import Settings from './pages/Settings';

function Workspace({ demo, onExitDemo }) {
  const { session, loading, recovery } = useAuth();
  if (loading && !demo) return <div className="startup-screen"><Spinner label="Getting your garage ready…"/></div>;
  if (recovery) return <Navigate to="/reset-password" replace/>;
  if (!demo && !session) return <Navigate to="/login" replace/>;
  const user = demo ? { id: 'sample-user', email: 'alex@example.com' } : session.user;
  return <DataProvider key={`${demo ? 'demo' : 'supabase'}-${user.id}`} mode={demo ? 'demo' : 'supabase'} user={user}><ActionsProvider><Layout onExitDemo={onExitDemo}><Outlet/></Layout></ActionsProvider></DataProvider>;
}
function Application() {
  const [demo, setDemo] = useState(false); const navigate = useNavigate();
  useEffect(() => {
    applyTheme(readTheme());
    const update = () => applyTheme(readTheme());
    const media = window.matchMedia('(prefers-color-scheme: dark)');
    window.addEventListener('mycar-theme-change', update); window.addEventListener('storage', update); media.addEventListener('change', update);
    return () => { window.removeEventListener('mycar-theme-change', update); window.removeEventListener('storage', update); media.removeEventListener('change', update); };
  }, []);
  const enterDemo = () => { setDemo(true); navigate('/dashboard', { replace: true }); };
  const exitDemo = () => { setDemo(false); navigate('/login', { replace: true }); };
  return <Routes><Route path="/login" element={<AuthPage screen="login" onDemo={enterDemo}/>}/><Route path="/signup" element={<AuthPage screen="signup" onDemo={enterDemo}/>}/><Route path="/forgot-password" element={<AuthPage screen="forgot" onDemo={enterDemo}/>}/><Route path="/reset-password" element={<ResetPasswordPage/>}/><Route path="/setup" element={<SetupPage/>}/><Route element={<Workspace demo={demo} onExitDemo={exitDemo}/>}><Route path="/dashboard" element={<Dashboard/>}/><Route path="/expenses" element={<Expenses/>}/><Route path="/vehicles" element={<Vehicles/>}/><Route path="/vehicles/:id" element={<VehicleDetail/>}/><Route path="/profile" element={<Profile/>}/><Route path="/settings" element={<Settings/>}/></Route><Route path="*" element={<Navigate to="/dashboard" replace/>}/></Routes>;
}
export default function App() { return <HashRouter><ToastProvider><InstallProvider><AuthProvider><a className="skip-link" href="#main-content" onClick={e => { e.preventDefault(); document.getElementById('main-content')?.focus(); }}>Skip to content</a><Application/></AuthProvider></InstallProvider></ToastProvider></HashRouter>; }
