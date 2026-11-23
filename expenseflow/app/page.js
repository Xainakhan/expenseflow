'use client';
import Link from 'next/link';
import { useState } from 'react';
import { TrendingUp, Wallet, Scale, Bell, ArrowRight, Clock, Target, BarChart3, UserRound } from 'lucide-react';
import { useStore, CATS, fmt } from '@/lib/store';

const key = (d) => d.slice(0, 7);
export default function Dashboard() {
  const { txs, budget, setBudget, user, settings, openDialog, ready } = useStore();
  const now = new Date();
  const cur = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const [month, setMonth] = useState(cur);
  const [showAlerts, setShowAlerts] = useState(false);
  if (!ready) return null;
  const months = [...Array(12)].map((_, i) => { const d = new Date(now.getFullYear(), now.getMonth() - i, 1); return [`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`, d.toLocaleString('en', { month: 'long', year: 'numeric' })]; });
  const [py, pm] = month.split('-').map(Number);
  const prev = `${pm === 1 ? py - 1 : py}-${String(pm === 1 ? 12 : pm - 1).padStart(2, '0')}`;
  const sum = (m, type) => txs.filter((t) => key(t.date) === m && t.type === type).reduce((a, t) => a + t.amount, 0);
  const inc = sum(month, 'income'), exp = sum(month, 'expense');
  const pct = (a, b) => (b ? Math.round(((a - b) / b) * 100) : null);
  const mt = txs.filter((t) => key(t.date) === month);
  const week = [0, 0, 0, 0, 0, 0, 0];
  mt.filter((t) => t.type === 'expense').forEach((t) => { week[(new Date(t.date).getDay() + 6) % 7] += t.amount; });
  const max = Math.max(...week, 1);
  const byCat = {};
  mt.filter((t) => t.type === 'expense').forEach((t) => { byCat[t.category] = (byCat[t.category] || 0) + t.amount; });
  const cats = Object.entries(byCat).sort((a, b) => b[1] - a[1]);
  let acc = 0;
  const grad = cats.length ? cats.map(([c, v]) => { const s = acc; acc += (v / exp) * 100; return `${CATS[c]} ${s}% ${acc}%`; }).join(',') : '#F1E6DC 0 100%';
  const used = Math.min((exp / budget) * 100, 100);
  const alerts = [];
  if (exp > budget) alerts.push({ title: 'Budget exceeded', text: `You are ${fmt(exp - budget)} over your monthly budget.`, level: 'danger' });
  else if (used >= 80) alerts.push({ title: 'Budget warning', text: `You have used ${Math.round(used)}% of your monthly budget.`, level: 'warning' });
  else alerts.push({ title: 'Budget on track', text: `${fmt(Math.max(budget - exp, 0))} remains in your monthly budget.`, level: 'good' });
  const notify = async () => {
    setShowAlerts((v) => !v);
    if (!settings.notify || typeof window === 'undefined' || !('Notification' in window)) return;
    const permission = Notification.permission === 'default' ? await Notification.requestPermission() : Notification.permission;
    if (permission === 'granted') new Notification(alerts[0].title, { body: alerts[0].text });
  };
  const recent = [...txs].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 5);
  const delta = (a, b, good) => { const p = pct(a, b); return p === null ? <span className="muted">No prior data</span> : <span style={{ color: (p >= 0) === good ? 'var(--green)' : 'var(--coral)' }}>{p >= 0 ? '↑' : '↓'} {Math.abs(p)}% vs last month</span>; };
  return (
    <>
      <header>
        <div><h1>Dashboard</h1><p className="muted">Your financial overview at a glance</p></div>
        <div className="hr">
          <select className="pill" value={month} onChange={(e) => setMonth(e.target.value)}>{months.map(([k, l]) => <option key={k} value={k}>{l}</option>)}</select>
          <div className="notification-wrap"><button className="pill round" aria-label="Show notifications" onClick={notify}><Bell size={20} />{alerts.some((a) => a.level !== 'good') && <i className="dot" />}</button>
            {showAlerts && <div className="notifications"><b>Notifications</b>{alerts.map((a) => <div className={'notice ' + a.level} key={a.title}><strong>{a.title}</strong><span>{a.text}</span></div>)}{!settings.notify && <small className="muted">Browser alerts are off. Enable them in Settings.</small>}</div>}
          </div>
          <div className="avatar" title={user.name || 'Your profile'}>{user.photo ? <img src={user.photo} alt={user.name || 'Your profile'} /> : user.name ? user.name.charAt(0).toUpperCase() : <UserRound size={22} aria-label="Your profile" />}</div>
        </div>
      </header>
      <section className="grid3">
        <div className="card sum g"><div className="ic"><TrendingUp /></div><div><p>Total Income</p><h2>{fmt(inc)}</h2>{delta(inc, sum(prev, 'income'), true)}</div></div>
        <div className="card sum r"><div className="ic"><Wallet /></div><div><p>Total Expenses</p><h2>{fmt(exp)}</h2>{delta(exp, sum(prev, 'expense'), false)}</div></div>
        <div className="card sum o"><div className="ic"><Scale /></div><div><p>Remaining Balance</p><h2>{fmt(inc - exp)}</h2><span className="muted">Income − Expenses</span></div></div>
      </section>
      <section className="grid2">
        <div className="card">
          <div className="ch"><h3><BarChart3 size={20} color="#F47732" /> Monthly Spending</h3><b>{fmt(exp)}</b></div>
          <div className="bars">{week.map((v, i) => (
            <div key={i} className="bar" title={fmt(v)}><span className="tip">{fmt(v)}</span><div style={{ height: `${(v / max) * 100}%` }} /><em>{['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][i]}</em></div>
          ))}</div>
        </div>
        <div className="card">
          <div className="ch"><h3><Target size={20} color="#F47732" /> Monthly Budget</h3><b>{fmt(budget)}</b></div>
          <div className="track"><div className={used > 90 ? 'fill warn' : 'fill'} style={{ width: used + '%' }} /></div>
          <div className="ch" style={{ marginTop: 12 }}><span>Spent: <b className="or">{fmt(exp)}</b></span><span>Remaining: <b className="gr">{fmt(Math.max(budget - exp, 0))}</b></span></div>
          {exp > budget ? <p className="alert">⚠ You have exceeded your budget.</p> : used >= 80 ? <p className="alert">⚠ You've used {Math.round(used)}% of your budget.</p> : <p className="muted">{Math.round(used)}% used</p>}
          <button className="btn soft" onClick={() => openDialog({ type: 'number', title: 'Set monthly budget', inputLabel: 'Budget amount (Rs.)', defaultValue: budget, confirmLabel: 'Save budget', onConfirm: setBudget })}>Set New Budget <ArrowRight size={16} /></button>
        </div>
      </section>
      <section className="grid2">
        <div className="card">
          <div className="ch"><h3><Clock size={20} color="#F47732" /> Recent Transactions</h3><Link href="/transactions" className="or">View All →</Link></div>
          {recent.map((t) => (
            <div className="tx" key={t.id}>
              <i style={{ background: CATS[t.category] + '33', color: CATS[t.category] }}>{t.title[0]}</i>
              <div><b>{t.title}</b><small className="muted">{t.category} · {t.method}</small></div>
              <span className="muted">{new Date(t.date).toLocaleString('en', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}</span>
              <b style={{ color: t.type === 'income' ? 'var(--green)' : 'var(--coral)' }}>{t.type === 'income' ? '+' : '−'} {fmt(t.amount)}</b>
            </div>
          ))}
        </div>
        <div className="card">
          <h3>Spending by Category</h3>
          <div className="donutw">
            <div className="donut" style={{ background: `conic-gradient(${grad})` }}><div><small>Rs.</small><b>{Math.round(exp).toLocaleString()}</b></div></div>
            <ul>{cats.map(([c, v]) => <li key={c}><i style={{ background: CATS[c] }} />{c}<b>{Math.round((v / exp) * 100)}%</b></li>)}</ul>
          </div>
        </div>
      </section>
    </>
  );
}
