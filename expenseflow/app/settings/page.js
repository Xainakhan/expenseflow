'use client';
import { useState } from 'react';
import { UserRound } from 'lucide-react';
import { useStore } from '@/lib/store';

export default function Settings() {
  const { user, settings, saveUser, saveSettings, txs, resetAll, openDialog, ready } = useStore();
  const [profile, setProfile] = useState(null);
  const [preferences, setPreferences] = useState(null);
  if (!ready) return null;
  const v = profile || user;
  const p = preferences || settings;
  const exportJson = () => {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([JSON.stringify(txs, null, 2)], { type: 'application/json' }));
    a.download = 'expenseflow-data.json'; a.click();
  };
  return (
    <>
      <header><div><h1>Settings</h1><p className="muted">Profile, currency and data</p></div></header>
      <div className="card set">
        <h3>Profile</h3>
        <div className="profile-editor">
          {v.photo ? <img src={v.photo} alt={v.name || 'Your profile'} /> : <span>{v.name ? v.name.charAt(0).toUpperCase() : <UserRound size={26} />}</span>}
          <label className="btn soft">Upload profile picture<input type="file" accept="image/*" onChange={(e) => { const file = e.target.files?.[0]; if (!file) return; const reader = new FileReader(); reader.onload = () => setProfile({ ...v, photo: reader.result }); reader.readAsDataURL(file); }} /></label>
          {v.photo && <button className="photo-remove" onClick={() => setProfile({ ...v, photo: '' })}>Remove</button>}
        </div>
        <label>Name<input value={v.name} placeholder="Your name" onChange={(e) => setProfile({ ...v, name: e.target.value })} /></label>
        <label>Email<input type="email" value={v.email || ''} placeholder="you@example.com" onChange={(e) => setProfile({ ...v, email: e.target.value })} /></label>
        <button className="btn" onClick={() => { saveUser(v); setProfile(null); }}>Save profile</button>
        <h3>Preferences</h3>
        <label>Currency symbol<select value={p.sym} onChange={(e) => setPreferences({ ...p, sym: e.target.value })}>{['Rs.', '$', '€', '£', '₹', 'AED'].map((c) => <option key={c}>{c}</option>)}</select></label>
        <label className="chk"><input type="checkbox" checked={p.notify} onChange={(e) => setPreferences({ ...p, notify: e.target.checked })} /> Budget warning notifications</label>
        <button className="btn" onClick={() => { saveSettings(p); setPreferences(null); }}>Save preferences</button>
        <h3>Data</h3>
        <div className="actions" style={{ justifyContent: 'flex-start' }}>
          <button className="btn ghost" onClick={exportJson}>Export data (JSON)</button>
          <button className="btn ghost" style={{ color: 'var(--coral)' }} onClick={() => openDialog({ title: 'Reset all data?', message: 'Your transactions, categories, budgets, and committee data will be replaced with sample data. Your profile will stay saved.', confirmLabel: 'Reset data', danger: true, onConfirm: resetAll })}>Reset data</button>
        </div>
      </div>
    </>
  );
}
