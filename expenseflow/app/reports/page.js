'use client';
import { useState } from 'react';
import { Download, Printer } from 'lucide-react';
import { useStore, CATS, fmt } from '@/lib/store';

const iso = (d) => new Date(d.getTime() - d.getTimezoneOffset() * 6e4).toISOString().slice(0, 10);
export default function Reports() {
  const { txs, ready } = useStore();
  const now = new Date();
  const [from, setFrom] = useState(iso(new Date(now.getFullYear(), now.getMonth(), 1)));
  const [to, setTo] = useState(iso(now));
  if (!ready) return null;
  const list = txs.filter((t) => t.date.slice(0, 10) >= from && t.date.slice(0, 10) <= to);
  const inc = list.filter((t) => t.type === 'income').reduce((a, t) => a + t.amount, 0);
  const exp = list.filter((t) => t.type === 'expense').reduce((a, t) => a + t.amount, 0);
  const days = Math.max(1, Math.round((new Date(to) - new Date(from)) / 864e5) + 1);
  const byCat = {};
  list.filter((t) => t.type === 'expense').forEach((t) => { byCat[t.category] = (byCat[t.category] || 0) + t.amount; });
  const cats = Object.entries(byCat).sort((a, b) => b[1] - a[1]);
  const yr = now.getFullYear();
  const months = [...Array(12)].map((_, i) => {
    const k = `${yr}-${String(i + 1).padStart(2, '0')}`, f = (ty) => txs.filter((t) => t.type === ty && t.date.slice(0, 7) === k).reduce((a, t) => a + t.amount, 0);
    return { l: new Date(yr, i, 1).toLocaleString('en', { month: 'short' }), i: f('income'), e: f('expense') };
  });
  const max = Math.max(...months.flatMap((m) => [m.i, m.e]), 1);
  const csv = () => {
    const rows = [['Date', 'Type', 'Title', 'Category', 'Method', 'Amount'], ...list.map((t) => [t.date, t.type, `"${t.title}"`, t.category, t.method, t.amount])];
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([rows.map((r) => r.join(',')).join('\n')], { type: 'text/csv' }));
    a.download = `expenseflow-${from}-to-${to}.csv`; a.click();
  };
  const Stat = ({ l, v, c }) => <div className="card"><p className="muted">{l}</p><h2 style={{ color: c, marginTop: 4 }}>{v}</h2></div>;
  return (
    <>
      <header><div><h1>Reports & Analytics</h1><p className="muted">Understand where your money goes</p></div>
        <div className="hr noprint"><button className="btn ghost" onClick={csv}><Download size={16} /> CSV</button><button className="btn" onClick={() => window.print()}><Printer size={16} /> PDF</button></div></header>
      <div className="filters noprint"><label className="muted">From <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} /></label><label className="muted">To <input type="date" value={to} onChange={(e) => setTo(e.target.value)} /></label></div>
      <section className="grid4">
        <Stat l="Income" v={fmt(inc)} c="var(--green)" /><Stat l="Expenses" v={fmt(exp)} c="var(--coral)" />
        <Stat l="Savings" v={`${fmt(inc - exp)} (${inc ? Math.round(((inc - exp) / inc) * 100) : 0}%)`} c="var(--or)" />
        <Stat l="Avg daily spending" v={fmt(exp / days)} />
      </section>
      <section className="grid2">
        <div className="card">
          <h3>Income vs Expense · {yr}</h3>
          <div className="bars" style={{ gap: 6 }}>{months.map((m) => (
            <div key={m.l} className="bar" style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 2 }}>
              <span className="tip">In {fmt(m.i)} / Out {fmt(m.e)}</span>
              <div style={{ flex: 1, height: `${(m.i / max) * 100}%`, background: 'var(--green)', borderRadius: '6px 6px 0 0' }} />
              <div style={{ flex: 1, height: `${(m.e / max) * 100}%` }} /><em>{m.l}</em>
            </div>))}</div>
        </div>
        <div className="card">
          <h3 style={{ marginBottom: 12 }}>Category-wise spending</h3>
          {cats.length ? <p className="muted" style={{ marginBottom: 12 }}>Highest: <b className="or">{cats[0][0]}</b> ({fmt(cats[0][1])})</p> : <p className="muted">No expenses in this range.</p>}
          {cats.map(([c, v]) => (
            <div key={c} style={{ marginBottom: 10 }}><div className="ch" style={{ marginBottom: 4 }}><span>{c}</span><b>{fmt(v)} · {Math.round((v / exp) * 100)}%</b></div>
              <div className="track" style={{ height: 8 }}><div className="fill" style={{ width: (v / exp) * 100 + '%', background: CATS[c] }} /></div></div>
          ))}
        </div>
      </section>
    </>
  );
}