import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { UserRound, Mail, Phone, MapPin, ShieldCheck, CarFront, CalendarDays, Check, LoaderCircle, ArrowRight, LockKeyhole, Pencil } from 'lucide-react';
import { useData } from '../lib/data';
import { useAuth } from '../lib/auth-context';
import { supabase, authRedirectUrl, authMessage, dataMessage } from '../lib/supabase';
import { Avatar, PageHeading, Field, Notice, useToast } from '../components/ui';
import { formatDate } from '../lib/logic.mjs';

export default function Profile() {
  const { profile, vehicles, expenses, saveProfile, demo } = useData(); const { session } = useAuth(); const notify = useToast();
  const [form, setForm] = useState({ full_name: profile.full_name || '', phone: profile.phone || '', city: profile.city || '', bio: profile.bio || '' });
  const [busy, setBusy] = useState(false); const [resetBusy, setResetBusy] = useState(false); const [error, setError] = useState('');
  useEffect(() => { setForm({ full_name: profile.full_name || '', phone: profile.phone || '', city: profile.city || '', bio: profile.bio || '' }); }, [profile.id]);
  const email = demo ? 'alex@example.com' : session?.user?.email || '';
  const dirty = Object.keys(form).some(key => form[key] !== (profile[key] || ''));
  const update = (key, value) => setForm(f => ({ ...f, [key]: value }));
  const submit = async e => {
    e.preventDefault(); setError('');
    if (!form.full_name.trim()) { setError('Please enter your name.'); return; }
    if (form.phone && !/^[+()\-\s.\d]{7,24}$/.test(form.phone)) { setError('Enter a valid phone number, or leave it blank.'); return; }
    setBusy(true);
    try { await saveProfile({ ...form, full_name: form.full_name.trim(), phone: form.phone.trim(), city: form.city.trim(), bio: form.bio.trim() }); notify(demo ? 'Sample profile updated for this preview.' : 'Your profile is looking up to date.'); }
    catch (err) { setError(dataMessage(err)); } finally { setBusy(false); }
  };
  const resetPassword = async () => {
    if (demo) { notify('Password resets are available only for a connected account.', 'info'); return; }
    setResetBusy(true);
    try { const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: authRedirectUrl('reset-password') }); if (error) throw error; notify('If your account is eligible, a password reset link will arrive by email.'); }
    catch (err) { notify(authMessage(err), 'error'); } finally { setResetBusy(false); }
  };
  return <div><PageHeading eyebrow="THE PERSON BEHIND THE WHEEL" title="Make yourself at home." description="Your personal details, kept neatly in one place."/><div className="profile-layout"><aside className="panel profile-summary"><div className="profile-cover"><span/><CarFront size={74} strokeWidth={.8}/><i/></div><Avatar name={profile.full_name} size="large"/><span className="profile-role">PERSONAL ACCOUNT</span><h2>{profile.full_name || 'Your name goes here'}</h2><p>{profile.bio || 'A little about you. A lot of journey ahead.'}</p><div className="profile-summary-details"><span><Mail size={16}/>{email}</span><span><MapPin size={16}/>{profile.city || 'Add your city'}</span><span><CalendarDays size={16}/>Joined {session?.user?.created_at ? formatDate(session.user.created_at.slice(0, 10)) : demo ? 'October 2026' : '—'}</span></div><div className="profile-numbers"><div><strong>{vehicles.length}</strong><span>Vehicles</span></div><div><strong>{expenses.length}</strong><span>Expenses logged</span></div></div><div className="profile-private"><ShieldCheck size={16}/>Your garage. Your data.</div></aside><div className="profile-main"><form className="panel profile-form" onSubmit={submit}><div className="panel-heading"><div><h2>Personal details</h2><p>The basics that make this space yours.</p></div><UserRound size={20} className="muted"/></div><div className="form-grid"><Field label="Full name" required className="full-span">{id => <input id={id} value={form.full_name} onChange={e => update('full_name', e.target.value)} autoComplete="name" maxLength={80} required/>}</Field><Field label="Email address" className="full-span" hint="Your sign-in email is managed by Supabase Authentication.">{id => <div className="input-with-icon readonly"><Mail size={17}/><input id={id} value={email} readOnly aria-describedby={`${id}-hint`}/><span className="verified-badge"><ShieldCheck size={12}/>Account email</span></div>}</Field><Field label="Phone number">{id => <input id={id} type="tel" value={form.phone} onChange={e => update('phone', e.target.value)} autoComplete="tel" maxLength={24} placeholder="Optional contact number"/>}</Field><Field label="City">{id => <input id={id} value={form.city} onChange={e => update('city', e.target.value)} autoComplete="address-level2" maxLength={80} placeholder="Where you call home"/>}</Field><Field label="A little about you" className="full-span" hint={`${form.bio.length}/250 characters`}>{id => <textarea id={id} rows={3} value={form.bio} onChange={e => update('bio', e.target.value)} maxLength={250} placeholder="Daily commuter? Weekend explorer? Tell us a little." aria-describedby={`${id}-hint`}/>}</Field></div>{error && <Notice type="error">{error}</Notice>}<footer className="profile-form-footer"><span>{dirty ? 'You have a few unsaved changes.' : 'Everything is up to date.'}</span><button className="button primary" disabled={busy || !dirty}>{busy ? <LoaderCircle size={16} className="spin"/> : <Check size={16}/>} {busy ? 'Saving…' : 'Save changes'}</button></footer></form><section className="panel security-panel"><span className="security-icon"><LockKeyhole size={23}/></span><div><h2>A little extra security</h2><p>Want a new password? We’ll email you a secure link to change it.</p><button className="text-button" onClick={resetPassword} disabled={resetBusy}>{resetBusy ? 'Sending reset link…' : 'Send password reset link'}<ArrowRight size={14}/></button></div></section></div></div></div>;
}
