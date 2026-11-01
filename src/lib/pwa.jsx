import { createContext, useContext, useEffect, useState } from 'react';
import { Download, Smartphone, Share, MoreVertical, Check, ArrowUpRight } from 'lucide-react';
import { Logo, Modal, Notice } from '../components/ui';

let pendingPrompt = null;
window.addEventListener('beforeinstallprompt', event => { event.preventDefault(); pendingPrompt = event; window.dispatchEvent(new Event('mycar-installable')); });
const InstallContext = createContext(null);
export function InstallProvider({ children }) {
  const [available, setAvailable] = useState(Boolean(pendingPrompt));
  const [installed, setInstalled] = useState(window.matchMedia('(display-mode: standalone)').matches);
  const [open, setOpen] = useState(false);
  const [outcome, setOutcome] = useState('');
  useEffect(() => {
    const ready = () => setAvailable(true);
    const done = () => { setInstalled(true); setAvailable(false); pendingPrompt = null; setOutcome('myCar is now on your home screen. Happy driving!'); };
    const media = window.matchMedia('(display-mode: standalone)');
    const display = e => setInstalled(e.matches);
    window.addEventListener('mycar-installable', ready); window.addEventListener('appinstalled', done); media.addEventListener('change', display);
    return () => { window.removeEventListener('mycar-installable', ready); window.removeEventListener('appinstalled', done); media.removeEventListener('change', display); };
  }, []);
  const install = async () => {
    if (!pendingPrompt) { setOpen(true); return; }
    try { await pendingPrompt.prompt(); const choice = await pendingPrompt.userChoice; setOutcome(choice.outcome === 'accepted' ? 'Installation started. Look for myCar on your home screen.' : 'No problem. You can install myCar whenever you’re ready.'); pendingPrompt = null; setAvailable(false); }
    catch { setOpen(true); }
  };
  return <InstallContext.Provider value={{ available, installed, install, showHelp: () => setOpen(true) }}>{children}{open && <Modal title={installed ? 'Already right at home' : 'Your garage, one tap away'} subtitle="Install myCar for an app-like experience." onClose={() => setOpen(false)}><div className="modal-body"><div className="install-illustration"><Logo compact/><span><Download size={23}/></span><Smartphone size={66} strokeWidth={1.2}/></div>{installed ? <Notice type="success">You’re using the installed myCar app.</Notice> : <><div className="install-step"><span><Share size={20}/></span><div><h3>iPhone or iPad</h3><p>Open this site in Safari. Tap Share, then <strong>Add to Home Screen</strong>.</p></div></div><div className="install-step"><span><MoreVertical size={20}/></span><div><h3>Android or desktop</h3><p>Open this site in Chrome or Edge. Open the browser menu and choose <strong>Install myCar</strong> or <strong>Add to Home screen</strong>.</p></div></div><p className="muted small">Use the app directly in your browser, not an embedded preview. Installation requires HTTPS (or localhost), and browser support varies.</p></>}{outcome && <Notice>{outcome}</Notice>}</div><footer className="modal-footer"><button className="button secondary" onClick={() => setOpen(false)}>Got it</button>{available && !installed && <button className="button primary" onClick={() => { setOpen(false); install(); }}><Download size={17}/>Install myCar</button>}</footer></Modal>}</InstallContext.Provider>;
}
export const useInstall = () => useContext(InstallContext);
