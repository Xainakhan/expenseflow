'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { Home, PlusCircle, LayoutGrid, BarChart3, Target, Settings, Wallet, Menu, X, Camera } from 'lucide-react';
import { Provider, useStore, EXPENSE_CATS } from '@/lib/store';

const NAV = [
  ['/', 'Dashboard', Home], ['add', 'Add Transaction', PlusCircle], ['/transactions', 'Transactions', LayoutGrid],
  ['/categories', 'Categories', LayoutGrid], ['/reports', 'Reports', BarChart3], ['/budget', 'Budget', Target], ['/settings', 'Settings', Settings],
];

function Form() {
  const { form, setForm, save, expCats, incCats } = useStore();
  const [f, setF] = useState(form);
  const [err, setErr] = useState({});
  const cats = f.type === 'income' ? incCats : expCats;
  const set = (k, v) => setF((p) => ({ ...p, [k]: v }));
  const submit = () => {
    const e = {};
    if (!f.title.trim()) e.title = 'Title is required';
    if (!(Number(f.amount) > 0)) e.amount = 'Enter an amount above 0';
    setErr(e);
    if (Object.keys(e).length) return;
    save({ ...f, amount: Number(f.amount) });
    setForm(null);
  };
  const attach = (file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => set('receipt', reader.result);
    reader.readAsDataURL(file);
  };
  return (
    <div className="overlay" onClick={() => setForm(null)}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h2>{f.id ? 'Edit' : 'Add'} Transaction</h2>
        <div className="seg">
          {['expense', 'income'].map((t) => (
            <button key={t} className={f.type === t ? 'on' : ''} onClick={() => setF({ ...f, type: t, category: (t === 'income' ? incCats : expCats)[0] })}>{t}</button>
          ))}
        </div>
        <label>Title<input value={f.title} onChange={(e) => set('title', e.target.value)} />{err.title && <small>{err.title}</small>}</label>
        <div className="row2">
          <label>Amount (Rs.)<input type="number" value={f.amount} onChange={(e) => set('amount', e.target.value)} />{err.amount && <small>{err.amount}</small>}</label>
          <label>Category<select value={f.category} onChange={(e) => set('category', e.target.value)}>{cats.map((c) => <option key={c}>{c}</option>)}</select></label>
        </div>
        <label>Transaction evidence / invoice
          <input type="file" accept="image/*" capture="environment" onChange={(e) => attach(e.target.files?.[0])} />
        </label>
        {f.receipt && <div className="receipt-preview"><img src={f.receipt} alt="Transaction evidence" /><button type="button" onClick={() => set('receipt', '')}>Remove image</button></div>}
        <div className="row2">
          <label>Date<input type="datetime-local" value={f.date} onChange={(e) => set('date', e.target.value)} /></label>
          <label>Payment method<select value={f.method} onChange={(e) => set('method', e.target.value)}>{['Card', 'Cash', 'Bank', 'Wallet'].map((c) => <option key={c}>{c}</option>)}</select></label>
        </div>
        <div className="actions"><button className="btn ghost" onClick={() => setForm(null)}>Cancel</button><button className="btn" onClick={submit}>Save Transaction</button></div>
      </div>
    </div>
  );
}

function ReceiptChat() {
  const { setForm } = useStore();
  const [open, setOpen] = useState(false), [error, setError] = useState('');
  const video = useRef(null), stream = useRef(null);
  const stop = () => { stream.current?.getTracks().forEach((track) => track.stop()); stream.current = null; };
  useEffect(() => () => stop(), []);
  const start = async () => {
    setOpen(true); setError('');
    try {
      const media = await navigator.mediaDevices.getUserMedia({ video: { facingMode: { ideal: 'environment' } }, audio: false });
      stream.current = media;
      await new Promise((resolve) => requestAnimationFrame(resolve));
      if (video.current) { video.current.srcObject = media; await video.current.play(); }
    } catch { setError('Camera permission was not granted or no camera is available.'); }
  };
  const take = () => {
    const canvas = document.createElement('canvas');
    canvas.width = video.current.videoWidth; canvas.height = video.current.videoHeight;
    canvas.getContext('2d').drawImage(video.current, 0, 0);
    const receipt = canvas.toDataURL('image/jpeg', .85);
    stop(); setOpen(false);
    setForm({ type: 'expense', title: '', amount: '', category: EXPENSE_CATS[0], date: new Date(Date.now() - new Date().getTimezoneOffset() * 6e4).toISOString().slice(0, 16), method: 'Card', receipt });
  };
  return <>
    <button className="receipt-chat" aria-label="Capture invoice with camera" title="Capture invoice" onClick={start}><Camera size={24} /></button>
    {open && <div className="overlay" onClick={() => { stop(); setOpen(false); }}><div className="modal camera-modal" onClick={(e) => e.stopPropagation()}>
      <h2><Camera size={22} /> Capture invoice</h2>{error ? <p className="alert">{error}</p> : <video ref={video} autoPlay playsInline muted />}
      <div className="actions"><button className="btn ghost" onClick={() => { stop(); setOpen(false); }}>Cancel</button>{!error && <button className="btn" onClick={take}>Take photo</button>}</div>
    </div></div>}
  </>;
}

function AppDialog() {
  const { dialog, closeDialog } = useStore();
  const [value, setValue] = useState('');
  useEffect(() => { setValue(dialog?.defaultValue ?? ''); }, [dialog]);
  if (!dialog) return null;
  const confirm = () => {
    const result = dialog.type === 'number' ? Number(value) : undefined;
    if (dialog.type === 'number' && !(result > 0)) return;
    dialog.onConfirm?.(result);
    closeDialog();
  };
  return <div className="overlay" role="presentation" onMouseDown={closeDialog}>
    <div className="modal app-dialog" role="dialog" aria-modal="true" aria-labelledby="dialog-title" onMouseDown={(e) => e.stopPropagation()}>
      <h2 id="dialog-title">{dialog.title}</h2>
      {dialog.message && <p className="muted">{dialog.message}</p>}
      {dialog.type === 'number' && <label>{dialog.inputLabel}<input autoFocus type="number" min="1" value={value} onChange={(e) => setValue(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && confirm()} /></label>}
      <div className="actions"><button className="btn ghost" onClick={closeDialog}>Cancel</button><button className={'btn' + (dialog.danger ? ' danger' : '')} onClick={confirm}>{dialog.confirmLabel || 'Confirm'}</button></div>
    </div>
  </div>;
}

function Inner({ children }) {
  const path = usePathname();
  const { form, setForm, toast } = useStore();
  const [open, setOpen] = useState(false);
  const blank = () => ({ type: 'expense', title: '', amount: '', category: EXPENSE_CATS[0], date: new Date(Date.now() - new Date().getTimezoneOffset() * 6e4).toISOString().slice(0, 16), method: 'Card' });
  return (
    <div className="app">
      <button className="burger" onClick={() => setOpen(!open)}>{open ? <X /> : <Menu />}</button>
      <aside className={'side ' + (open ? 'open' : '')}>
        <div className="logo"><i /><i /><i /><b>Expense<span>Flow</span></b></div>
        <nav>
          {NAV.map(([href, label, Icon]) => href === 'add'
            ? <button key={label} onClick={() => { setForm(blank()); setOpen(false); }}><Icon size={20} />{label}</button>
            : <Link key={label} href={href} onClick={() => setOpen(false)} className={path === href ? 'active' : ''}><Icon size={20} />{label}</Link>)}
        </nav>
        <div className="promo"><Wallet size={44} color="#F47732" /><p>Track smarter.<br />Spend better!</p></div>
      </aside>
      <main>{children}</main>
      {form && <Form key={form.id || 'new'} />}
      <ReceiptChat />
      <AppDialog />
      {toast && <div className="toast">✓ {toast}</div>}
    </div>
  );
}
export default function Shell({ children }) { return <Provider><Inner>{children}</Inner></Provider>; }
