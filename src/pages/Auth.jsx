import { useEffect, useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { ArrowRight, ArrowLeft, Mail, LockKeyhole, UserRound, Eye, EyeOff, ShieldCheck, Check, LoaderCircle, CarFront, Route, ChartNoAxesCombined, Sparkles } from 'lucide-react';
import { supabase, configured, configError, authRedirectUrl, authMessage } from '../lib/supabase';
import { useAuth } from '../lib/auth-context';
import { Logo, Notice, Field, useToast } from '../components/ui';

const asset = `${import.meta.env.BASE_URL}images/suv-forest.webp`;
export function AuthStory() { return <section className="auth-story"><Logo light/><div className="auth-story-copy"><div className="story-eyebrow"><span/>LESS ADMIN. MORE OPEN ROAD.</div><h1>Good times.<br/>Great drives.<br/><span>All accounted for.</span></h1><p>Your vehicles, expenses, and little reminders.<br/>Together in one happy place.</p></div><div className="auth-car"><img src={asset} alt="Silver SUV on a forest-green studio background"/><span className="car-story-chip"><ShieldCheck size={16}/>A little care goes a long way.</span></div><div className="auth-story-footer"><span>MADE FOR THE JOURNEY</span><span>myCar · Your personal garage</span></div></section>; }

export default function AuthPage({ screen = 'login', onDemo }) {
  const { session, recovery, linkError, clearLinkError } = useAuth();
  const navigate = useNavigate();
  const signup = screen === 'signup', forgot = screen === 'forgot';
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [visible, setVisible] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  useEffect(() => { setError(linkError || ''); setSuccess(false); setCooldown(0); }, [screen, linkError]);
  useEffect(() => { if (!cooldown) return; const timer = setTimeout(() => setCooldown(n => n - 1), 1000); return () => clearTimeout(timer); }, [cooldown]);
  if (session && !recovery) return <Navigate to="/dashboard" replace/>;
  const update = (key, value) => setForm(f => ({ ...f, [key]: value }));
  const submit = async e => {
    e.preventDefault(); setError(''); clearLinkError();
    if (!configured || !supabase) { setError(configError || 'Supabase isn’t connected yet. Add your project settings to enable accounts, or explore the sample workspace below.'); return; }
    if (signup && !form.name.trim()) { setError('Please enter your name.'); return; }
    if ((signup || forgot) && cooldown) return;
    setBusy(true);
    try {
      if (signup) {
        if (form.password.length < 10) throw new Error('Use at least 10 characters for your password.');
        const { error } = await supabase.auth.signUp({ email: form.email.trim(), password: form.password, options: { data: { full_name: form.name.trim() }, emailRedirectTo: authRedirectUrl('login') } });
        if (error) throw error;
        setSuccess(true); setForm(f => ({ ...f, password: '' }));
      } else if (forgot) {
        const { error } = await supabase.auth.resetPasswordForEmail(form.email.trim(), { redirectTo: authRedirectUrl('reset-password') });
        if (error) throw error;
        setSuccess(true); setCooldown(60);
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email: form.email.trim(), password: form.password });
        if (error) throw error;
        navigate('/dashboard', { replace: true });
      }
    } catch (err) { setError(err.code || err.status ? authMessage(err) : err.message); }
    finally { setBusy(false); }
  };
  const title = success ? (forgot ? 'A fresh start is in your inbox.' : 'One little step to go.') : signup ? 'Your garage starts here.' : forgot ? 'Let’s get you back on track.' : 'Welcome back.';
  return <main className="auth-page"><AuthStory/><section className="auth-form-side"><div className="auth-topline"><span>{signup ? 'A GOOD PLACE TO START' : 'YOUR PERSONAL GARAGE'}</span><Link to="/setup">Setup guide <ArrowUpRightSmall/></Link></div><div className="auth-form-content">{!success && (forgot ? <Link to="/login" className="back-link"><ArrowLeft size={16}/>Back to sign in</Link> : <div className="auth-tabs"><Link className={!signup ? 'active' : ''} to="/login">Sign in</Link><Link className={signup ? 'active' : ''} to="/signup">Create account</Link></div>)}<div className="auth-form-heading"><span className="auth-symbol">{success ? <Mail size={26}/> : signup ? <CarFront size={27}/> : forgot ? <LockKeyhole size={25}/> : <Route size={26}/>}</span><h2>{title}</h2><p>{success ? forgot ? `If an account exists for ${form.email}, a password reset link will arrive shortly. Check your spam folder, too.` : `If this email is available, we’ll send a confirmation link to ${form.email}. Confirm it, then sign in to start your garage.` : signup ? 'A little less paperwork. A lot more peace of mind.' : forgot ? 'Enter your account email and we’ll send you a secure reset link.' : 'Sign in to pick up where you left off. Your journey, all in one place.'}</p></div>{!configured && !success && <div className="connection-note"><span className="status-dot"/>Accounts aren’t connected yet. <Link to="/setup">Connect Supabase <ArrowRight size={12}/></Link></div>}{success ? <div className="auth-success"><Notice type="success">{forgot ? 'The link opens a page to choose a new password. For your security, it can only be used once.' : 'Your vehicles and expenses will be private to your account.'}</Notice><Link to="/login" className="button primary full">Back to sign in<ArrowRight size={17}/></Link>{forgot && <button className="text-button resend-button" disabled={cooldown > 0 || busy} onClick={submit}>{cooldown ? `Request another link in ${cooldown}s` : 'Didn’t get it? Send another link'}</button>}</div> : <form onSubmit={submit} className="auth-form" aria-busy={busy}>{signup && <Field label="Full name" required>{id => <div className="input-with-icon"><UserRound size={18}/><input id={id} autoComplete="name" placeholder="Your full name" value={form.name} onChange={e => update('name', e.target.value)} maxLength={80} required/></div>}</Field>}{<Field label="Email address" required>{id => <div className="input-with-icon"><Mail size={18}/><input id={id} type="email" autoComplete="email" placeholder="you@example.com" value={form.email} onChange={e => update('email', e.target.value)} maxLength={254} required/></div>}</Field>}{!forgot && <Field label="Password" required hint={signup ? 'At least 10 characters. Make it something only you know.' : undefined}>{id => <div className="input-with-icon"><LockKeyhole size={18}/><input id={id} type={visible ? 'text' : 'password'} autoComplete={signup ? 'new-password' : 'current-password'} placeholder={signup ? 'Create a strong password' : 'Enter your password'} value={form.password} onChange={e => update('password', e.target.value)} minLength={signup ? 10 : 1} maxLength={128} required aria-describedby={signup ? `${id}-hint` : undefined}/><button type="button" className="icon-button" aria-label={visible ? 'Hide password' : 'Show password'} onClick={() => setVisible(v => !v)}>{visible ? <EyeOff size={18}/> : <Eye size={18}/>}</button></div>}</Field>}{!signup && !forgot && <div className="forgot-row"><span><ShieldCheck size={13}/>Private by design</span><Link to="/forgot-password">Forgot password?</Link></div>}{error && <Notice type="error">{error}</Notice>}<button className="button primary full auth-submit" disabled={busy || ((signup || forgot) && cooldown > 0)}>{busy ? <LoaderCircle size={18} className="spin"/> : null}{busy ? 'Just a moment…' : signup ? 'Create my account' : forgot ? 'Send reset link' : 'Sign in to myCar'}{!busy && <ArrowRight size={18}/>}</button></form>}{!success && !forgot && <><div className="auth-divider"><span/>{signup ? 'Already part of the journey?' : 'New around here?'}<span/></div><Link className="button secondary full" to={signup ? '/login' : '/signup'}>{signup ? 'Sign in instead' : 'Create an account'}<ArrowRight size={16}/></Link></>}<div className="sample-entry"><span>Just taking a look?</span><button onClick={onDemo}>Explore a sample workspace<ArrowRight size={15}/></button><small>Fictional data · No account needed · Nothing is saved</small></div></div><footer className="auth-form-footer"><span><ShieldCheck size={14}/>Your garage. Your data. Always yours.</span><span>© {new Date().getFullYear()} myCar</span></footer></section></main>;
}
function ArrowUpRightSmall() { return <svg width="13" height="13" viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M4 12 12 4M4 4h8v8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>; }

export function ResetPasswordPage() {
  const { session, recovery, setRecovery } = useAuth();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);
  const [visible, setVisible] = useState(false);
  const navigate = useNavigate(); const notify = useToast();
  const submit = async e => {
    e.preventDefault(); setError('');
    if (password.length < 10) { setError('Use at least 10 characters for your new password.'); return; }
    if (password !== confirm) { setError('The passwords don’t match. Please check both fields.'); return; }
    if (!supabase || !session) { setError('Open a fresh password reset link from your email first.'); return; }
    setBusy(true);
    try { const { error } = await supabase.auth.updateUser({ password }); if (error) throw error; setRecovery(false); setDone(true); setPassword(''); setConfirm(''); notify('Your password has been updated.'); }
    catch (err) { setError(authMessage(err)); } finally { setBusy(false); }
  };
  return <main className="auth-page"><AuthStory/><section className="auth-form-side"><div className="auth-topline"><span>KEEP YOUR GARAGE SAFE</span><ShieldCheck size={18}/></div><div className="auth-form-content"><Link to="/login" className="back-link"><ArrowLeft size={16}/>Back to sign in</Link><div className="auth-form-heading"><span className="auth-symbol">{done ? <Check size={27}/> : <LockKeyhole size={26}/>}</span><h2>{done ? 'All set. Fresh start.' : 'A new password. Same journey.'}</h2><p>{done ? 'Your password is updated and you’re signed in. Your garage is ready when you are.' : 'Choose a strong password to keep your vehicles and expenses protected.'}</p></div>{done ? <button className="button primary full" onClick={() => navigate('/dashboard')}>Go to my dashboard<ArrowRight size={17}/></button> : !session ? <><Notice>Your reset link is missing, expired, or already used. Request a new one to continue.</Notice><Link to="/forgot-password" className="button primary full mt-5">Request a new link<ArrowRight size={17}/></Link></> : <form className="auth-form" onSubmit={submit}><Field label="New password" required hint="At least 10 characters">{id => <div className="input-with-icon"><LockKeyhole size={18}/><input id={id} type={visible ? 'text' : 'password'} autoComplete="new-password" value={password} onChange={e => setPassword(e.target.value)} minLength={10} maxLength={128} required/><button type="button" className="icon-button" aria-label={visible ? 'Hide passwords' : 'Show passwords'} onClick={() => setVisible(v => !v)}>{visible ? <EyeOff size={18}/> : <Eye size={18}/>}</button></div>}</Field><Field label="Confirm new password" required>{id => <div className="input-with-icon"><LockKeyhole size={18}/><input id={id} type={visible ? 'text' : 'password'} autoComplete="new-password" value={confirm} onChange={e => setConfirm(e.target.value)} minLength={10} maxLength={128} required/></div>}</Field>{error && <Notice type="error">{error}</Notice>}<button className="button primary full" disabled={busy}>{busy ? <LoaderCircle className="spin" size={17}/> : <Check size={17}/>} {busy ? 'Updating…' : 'Update password'}</button></form>}</div><footer className="auth-form-footer"><span><ShieldCheck size={14}/>A little care. A lot of peace of mind.</span></footer></section></main>;
}
