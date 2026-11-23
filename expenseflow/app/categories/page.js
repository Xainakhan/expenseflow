'use client';
import { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { useStore, CATS, EXPENSE_CATS, INCOME_CATS, fmt } from '@/lib/store';

const COLORS = ['#FF8A3D', '#FFC02E', '#4DB6F5', '#A98BDB', '#F29BB5', '#6CCBA5', '#8FA7F0', '#EF7770'];
export default function Categories() {
  const { custom, addCat, delCat, txs, openDialog, ready } = useStore();
  const [name, setName] = useState(''), [type, setType] = useState('expense'), [color, setColor] = useState(COLORS[0]), [err, setErr] = useState('');
  if (!ready) return null;
  const month = new Date().toISOString().slice(0, 7);
  const spent = (c) => txs.filter((t) => t.category === c && t.date.slice(0, 7) === month).reduce((a, t) => a + t.amount, 0);
  const add = () => {
    const n = name.trim();
    if (!n) return setErr('Enter a name');
    if (CATS[n]) return setErr('Category already exists');
    setErr(''); addCat({ name: n, type, color }); setName('');
  };
  const group = (title, defaults, t) => (
    <div className="card" style={{ marginBottom: 20 }}>
      <h3 style={{ marginBottom: 14 }}>{title}</h3>
      <div className="cgrid">
        {[...defaults, ...custom.filter((c) => c.type === t).map((c) => c.name)].map((c) => (
          <div className="chip" key={c} style={{ borderColor: CATS[c] }}>
            <i style={{ background: CATS[c] }} /><div><b>{c}</b><small className="muted">{fmt(spent(c))} this month</small></div>
            {!defaults.includes(c) && <button onClick={() => openDialog({ title: 'Delete category?', message: `Remove “${c}” from your categories?`, confirmLabel: 'Delete', danger: true, onConfirm: () => delCat(c) })}><Trash2 size={16} /></button>}
          </div>
        ))}
      </div>
    </div>
  );
  return (
    <>
      <header><div><h1>Categories</h1><p className="muted">Organise your income and expenses</p></div></header>
      <div className="card" style={{ marginBottom: 20 }}>
        <h3 style={{ marginBottom: 14 }}>Add category</h3>
        <div className="filters">
          <input placeholder="Category name" value={name} onChange={(e) => setName(e.target.value)} />
          <select value={type} onChange={(e) => setType(e.target.value)}><option value="expense">Expense</option><option value="income">Income</option></select>
          <div className="swatches">{COLORS.map((c) => <button key={c} onClick={() => setColor(c)} style={{ background: c, outline: color === c ? '3px solid var(--text)' : 'none' }} />)}</div>
          <button className="btn" onClick={add}><Plus size={16} /> Add</button>
        </div>
        {err && <p className="alert" style={{ margin: 0 }}>{err}</p>}
      </div>
      {group('Income', INCOME_CATS, 'income')}
      {group('Expenses', EXPENSE_CATS, 'expense')}
    </>
  );
}
