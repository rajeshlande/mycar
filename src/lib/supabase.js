import { createClient } from '@supabase/supabase-js';
import { isProjectUrl, isPublicKey } from './public-config.mjs';

const url = import.meta.env.VITE_SUPABASE_URL?.trim();
const key = import.meta.env.VITE_SUPABASE_ANON_KEY?.trim();
export const configError = url && !isProjectUrl(url) ? 'The Supabase URL must be an HTTPS project URL without credentials or query parameters.'
  : key && !isPublicKey(key) ? 'Use a publishable or legacy anon key. Secret and service-role keys must never be used in this app.' : '';
export const configured = Boolean(isProjectUrl(url) && isPublicKey(key));
export const supabase = configured ? createClient(url, key, {
  auth: { flowType: 'pkce', detectSessionInUrl: true, persistSession: true, autoRefreshToken: true },
}) : null;
export function appRoot() { return new URL(import.meta.env.BASE_URL, document.baseURI).href; }
export function authRedirectUrl(route = 'login') { return `${appRoot()}#/${route}`; }
export function authMessage(error) {
  const code = error?.code || '';
  if (code === 'invalid_credentials') return 'That email and password don’t match. Please try again.';
  if (code === 'email_not_confirmed') return 'Please confirm your email using the link we sent, then sign in.';
  if (code === 'weak_password' || code === 'same_password') return 'Choose a stronger password that you haven’t used for this account before.';
  if (code === 'user_already_exists') return 'An account may already use this email. Try signing in or resetting your password.';
  if (code === 'signup_disabled') return 'New registrations are disabled in this Supabase project. Contact the project owner.';
  if (code === 'otp_expired' || code === 'bad_code_verifier' || code === 'flow_state_expired') return 'This link has expired or was already used. Request a new link in the same browser.';
  if (code === 'over_request_rate_limit' || code === 'over_email_send_rate_limit' || error?.status === 429) return 'Too many attempts or emails. Please wait before trying again.';
  if (error instanceof TypeError || (typeof navigator !== 'undefined' && !navigator.onLine)) return 'You appear to be offline. Reconnect and try again.';
  return 'We couldn’t complete that request. Please try again, or check your Supabase authentication settings.';
}
export function callbackError() {
  const query = new URLSearchParams(window.location.search);
  const hash = window.location.hash;
  if (hash.includes('?')) new URLSearchParams(hash.slice(hash.indexOf('?') + 1)).forEach((value, key) => query.set(key, value));
  if (!query.has('error')) return '';
  return query.get('error') === 'access_denied' ? 'This email link is invalid or has expired. Please request a new one below.' : 'We couldn’t verify that email link. Please request a new one.';
}
export function dataMessage(error) {
  if (error?.code === 'PGRST205' || error?.code === 'PGRST204' || error?.code === '42P01') return 'The myCar database isn’t ready. Run supabase/schema.sql in your Supabase SQL Editor, then retry.';
  if (error?.code === '42501' || error?.code === 'PGRST301') return 'You don’t have permission for this record. Sign in again or check the database security policies.';
  if (error?.code === '23505') return 'A vehicle with that registration number already exists in your garage.';
  if (error?.code === '23503') return 'The selected vehicle no longer exists. Refresh your garage and try again.';
  if (error?.code === '23514') return 'One of the values is outside the allowed range. Check the form and try again.';
  if (error instanceof TypeError || (typeof navigator !== 'undefined' && !navigator.onLine)) return 'You’re offline. Your existing records are safe; reconnect to load or save changes.';
  return 'We couldn’t save or load your data. Please try again. No success is assumed until Supabase confirms it.';
}
