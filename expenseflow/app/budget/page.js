'use client';
import { useState } from 'react';
import { useStore, fmt } from '@/lib/store';

export default function Budget() {
  const { txs, budget, setBudget, catBudgets, setCatBudget, expCats, committee, setCommittee, ready } = useStore();
  const [val, setVal] = useState('');
  if (!ready) return null;
  const now = new Date();
  const key = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
  const spentIn = (m, c) => txs.filter((t) => t.type === 'expense' && t.date.slice(0, 7) === m && (!c || t.category === c)).reduce((a, t) => a + t.amount, 0);
  const m = key(now), spent = spentIn(m), pct = (a, b) => Math.min((a / b) * 100, 100);
  const byCategory = expCats.map((c) => ({ name: c, spent: spentIn(m, c), limit: Number(catBudgets[c] || 0) })).filter((x) => x.spent).sort((a, b) => b.spent - a.spent);
  const top = byCategory[0];
  const safeToSave = Math.max(budget - spent, 0);
  const hist = [...Array(6)].map((_, i) => { const d = new Date(now.getFullYear(), now.getMonth() - i, 1); return { label: d.toLocaleString('en', { month: 'short', year: 'numeric' }), s: spentIn(key(d)) }; });
  return (
    <>
      <header><div><h1>Budget</h1><p className="muted">Set limits and track spending against them</p></div></header>
      <section className="grid2">
        <div className="card">
          <div className="ch"><h3>Monthly budget</h3><b>{fmt(budget)}</b></div>
          <div className="track"><div className={spent > budget * 0.9 ? 'fill warn' : 'fill'} style={{ width: pct(spent, budget) + '%' }} /></div>
          <div className="ch" style={{ marginTop: 12 }}><span>Spent: <b className="or">{fmt(spent)}</b></span><span>Remaining: <b className="gr">{fmt(Math.max(budget - spent, 0))}</b></span></div>
          {spent > budget ? <p className="alert">⚠ Over budget by {fmt(spent - budget)}.</p> : spent > budget * 0.8 && <p className="alert">⚠ You've used {Math.round((spent / budget) * 100)}% of your budget.</p>}
          <div className="filters" style={{ marginTop: 14 }}>
            <input type="number" placeholder="New monthly budget" value={val} onChange={(e) => setVal(e.target.value)} />
            <button className="btn" onClick={() => { if (Number(val) > 0) { setBudget(Number(val)); setVal(''); } }}>Save</button>
          </div>
        </div>
        <div className="card">
          <h3 style={{ marginBottom: 14 }}>Budget history</h3>
          {hist.map((h) => (
            <div key={h.label} style={{ marginBottom: 12 }}>
              <div className="ch" style={{ marginBottom: 4 }}><span>{h.label}</span><b style={{ color: h.s > budget ? 'var(--coral)' : 'var(--green)' }}>{fmt(h.s)} {h.s > budget ? '· over' : '· ok'}</b></div>
              <div className="track" style={{ height: 8 }}><div className={h.s > budget ? 'fill warn' : 'fill'} style={{ width: pct(h.s, budget) + '%' }} /></div>
            </div>
          ))}
        </div>
      </section>
      <section className="grid2">
        <div className="card insight-card">
          <h3>Smart spending guidance</h3>
          {spent > budget ? <p className="alert">You are {fmt(spent - budget)} over plan. Pause non-essential purchases until the next cycle.</p> : <p className="muted">You have {fmt(safeToSave)} left in this month’s plan.</p>}
          {top && <div className="insight"><b>{top.name}</b><span>{fmt(top.spent)} is your highest spend category this month.</span>{top.limit > 0 && top.spent > top.limit * .8 && <small>Try reducing it by {fmt(Math.ceil(top.spent * .1))} next month to create breathing room.</small>}</div>}
          {byCategory.slice(0, 3).map((x) => <div className="suggestion" key={x.name}><span>Reduce {x.name} by 10%</span><b>Save {fmt(Math.ceil(x.spent * .1))}</b></div>)}
        </div>
        <div className="card committee-card">
          <h3>E-Committee savings</h3><p className="muted">Commit part of your remaining budget to a shared saving goal.</p>
          <label className="toggle"><input type="checkbox" checked={committee.enabled} onChange={(e) => setCommittee({ ...committee, enabled: e.target.checked })} /> Enable E-Committee</label>
          <div className="row2"><label>Goal amount<input type="number" value={committee.target || ''} placeholder="e.g. 100000" onChange={(e) => setCommittee({ ...committee, target: Number(e.target.value) })} /></label><label>Monthly saving<input type="number" value={committee.contribution || ''} placeholder={safeToSave.toString()} onChange={(e) => setCommittee({ ...committee, contribution: Number(e.target.value) })} /></label></div>
          {committee.enabled && <p className={committee.contribution > safeToSave ? 'alert' : 'committee-ok'}>{committee.contribution > safeToSave ? 'Your selected contribution is higher than this month’s remaining budget.' : `You can set aside ${fmt(committee.contribution || safeToSave)} this month.`}</p>}
        </div>
      </section>
      <div className="card">
        <h3 style={{ marginBottom: 14 }}>Category budgets</h3>
        {expCats.map((c) => {
          const lim = catBudgets[c] || 0, s = spentIn(m, c);
          return (
            <div className="cb" key={c}>
              <b>{c}</b>
              <div><div className="track" style={{ height: 8 }}><div className={lim && s > lim ? 'fill warn' : 'fill'} style={{ width: lim ? pct(s, lim) + '%' : '0%' }} /></div>
                <small className="muted">{fmt(s)} spent{lim ? ` · ${s > lim ? 'over by ' + fmt(s - lim) : fmt(lim - s) + ' left'}` : ' · no limit set'}</small></div>
              <input type="number" placeholder="Limit" defaultValue={lim || ''} onBlur={(e) => { const v = Number(e.target.value); if (v !== lim && v >= 0) setCatBudget(c, v); }} />
            </div>
          );
        })}
      </div>
    </>
  );
}
