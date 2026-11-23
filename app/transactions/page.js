'use client';
import { useState } from 'react';
import { Pencil, Trash2, Plus, Image as ImageIcon } from 'lucide-react';
import { useStore, CATS, fmt } from '@/lib/store';

const PER = 8;
export default function Transactions() {
  const { txs, remove, setForm, openDialog, ready } = useStore();
  const [q, setQ] = useState(''), [type, setType] = useState('all'), [cat, setCat] = useState('all'), [sort, setSort] = useState('date'), [page, setPage] = useState(1);
  if (!ready) return null;
  const list = txs
    .filter((t) => (type === 'all' || t.type === type) && (cat === 'all' || t.category === cat) && t.title.toLowerCase().includes(q.toLowerCase()))
    .sort((a, b) => (sort === 'amount' ? b.amount - a.amount : b.date.localeCompare(a.date)));
  const pages = Math.max(1, Math.ceil(list.length / PER));
  const p = Math.min(page, pages);
  return (
    <>
      <header><div><h1>Transactions</h1><p className="muted">Search, filter and manage everything</p></div>
        <button className="btn" onClick={() => setForm({ type: 'expense', title: '', amount: '', category: 'Food & Dining', date: new Date().toISOString().slice(0, 16), method: 'Card' })}><Plus size={16} /> Add</button></header>
      <div className="card">
        <div className="filters">
          <input placeholder="Search…" value={q} onChange={(e) => { setQ(e.target.value); setPage(1); }} />
          <select value={type} onChange={(e) => { setType(e.target.value); setPage(1); }}><option value="all">All types</option><option value="income">Income</option><option value="expense">Expense</option></select>
          <select value={cat} onChange={(e) => { setCat(e.target.value); setPage(1); }}><option value="all">All categories</option>{Object.keys(CATS).map((c) => <option key={c}>{c}</option>)}</select>
          <select value={sort} onChange={(e) => setSort(e.target.value)}><option value="date">Sort: Date</option><option value="amount">Sort: Amount</option></select>
        </div>
        <div className="scroll"><table>
          <thead><tr><th>Title</th><th>Evidence</th><th>Category</th><th>Date & time</th><th>Method</th><th>Amount</th><th /></tr></thead>
          <tbody>{list.slice((p - 1) * PER, p * PER).map((t) => (
            <tr key={t.id}><td><b>{t.title}</b></td><td>{t.receipt ? <a className="evidence" href={t.receipt} target="_blank" title="View receipt"><ImageIcon size={17} /> View</a> : <span className="muted">No image</span>}</td><td>{t.category}</td><td>{new Date(t.date).toLocaleString('en', { dateStyle: 'medium', timeStyle: 'short' })}</td><td>{t.method}</td>
              <td style={{ color: t.type === 'income' ? 'var(--green)' : 'var(--coral)', fontWeight: 700 }}>{t.type === 'income' ? '+' : '−'} {fmt(t.amount)}</td>
              <td className="ta"><button onClick={() => setForm(t)}><Pencil size={16} /></button><button onClick={() => openDialog({ title: 'Delete transaction?', message: `Delete “${t.title}”? This cannot be undone.`, confirmLabel: 'Delete', danger: true, onConfirm: () => remove(t.id) })}><Trash2 size={16} /></button></td></tr>
          ))}</tbody>
        </table></div>
        {!list.length && <p className="muted" style={{ textAlign: 'center', padding: 24 }}>No transactions found.</p>}
        <div className="pager"><button disabled={p <= 1} onClick={() => setPage(p - 1)}>‹ Prev</button><span>Page {p} of {pages}</span><button disabled={p >= pages} onClick={() => setPage(p + 1)}>Next ›</button></div>
      </div>
    </>
  );
}
